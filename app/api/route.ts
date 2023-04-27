import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { CallbackManager } from "langchain/callbacks"
import { RetrievalQAChain } from "langchain/chains"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { OpenAI } from "langchain/llms/openai"
import { SupabaseHybridSearch } from "langchain/retrievers/supabase"

export const runtime = "nodejs"

export const dynamic = "force-dynamic"

const openAiKey = process.env.OPEN_AI_API_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

class ApplicationError extends Error {
  constructor(message: string, public data: Record<string, any> = {}) {
    super(message)
  }
}

class UserError extends ApplicationError {}

export async function POST(req) {
  try {
    if (!openAiKey) {
      throw new ApplicationError("Missing environment variable OPENAI_KEY")
    }

    if (!supabaseUrl) {
      throw new ApplicationError("Missing environment variable SUPABASE_URL")
    }

    if (!supabaseServiceKey) {
      throw new ApplicationError(
        "Missing environment variable SUPABASE_SERVICE_ROLE_KEY"
      )
    }

    const requestData = await req.json()

    if (!requestData) {
      throw new UserError("Missing request data")
    }

    const { query } = requestData
    if (!query) {
      throw new UserError("Missing query in request data")
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: openAiKey,
    })

    const retriever = new SupabaseHybridSearch(embeddings, {
      client: supabaseClient,
      similarityK: 2,
      keywordK: 2,
      tableName: "tbl_documents",
      similarityQueryName: "tbl_match_documents",
      keywordQueryName: "kw_match_documents",
    })

    let responseStream = new TransformStream()
    const writer = responseStream.writable.getWriter()
    const encoder = new TextEncoder()

    const handleNewToken = async (token: string) => {
      console.log("token: ", token)
      await writer.ready
      await writer.write(encoder.encode(`data: ${token}\n\n`))
    }

    const handleTokenEnd = async () => {
      await writer.ready
      await writer.write(encoder.encode(`data: CLOSE\n\n`))
      await writer.close()
    }

    const handleTokenError = async (error) => {
      await writer.ready
      await writer.abort(error)
    }

    const model = new OpenAI({
      openAIApiKey: openAiKey,
      streaming: true,
      callbacks: CallbackManager.fromHandlers({
        handleLLMNewToken(token) {
          handleNewToken(token)
        },
        handleLLMEnd: async () => {
          // handleTokenEnd()
        },
        handleLLMError: async (error) => {
          handleTokenError(error)
        },
      }),
    })

    const chain = RetrievalQAChain.fromLLM(model, retriever, {
      returnSourceDocuments: true,
    })

    chain
      .call({
        query: query,
      })
      .then(async (res) => {
        await writer.ready
        await writer.write(encoder.encode(`data: ${JSON.stringify(res)}\n\n`))
        await writer.write(encoder.encode(`data: CLOSE\n\n`))
        await writer.close()
      })
      .catch((error) => {
        handleTokenError(error)
      })

    return new NextResponse(responseStream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Content-Encoding": "none",
        "Cache-Control": "no-cache, no-transform",
      },
    })
  } catch (err: unknown) {
    if (err instanceof UserError) {
      return new NextResponse(
        JSON.stringify({
          error: err.message,
          data: err.data,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    } else if (err instanceof ApplicationError) {
      // Print out application errors with their additional data
      console.error(`${err.message}: ${JSON.stringify(err.data)}`)
    } else {
      // Print out unexpected errors as is to help with debugging
      console.error(err)
    }

    // TODO: include more response info in debug environments
    return new NextResponse(
      JSON.stringify({
        error: "There was an error processing your request",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
