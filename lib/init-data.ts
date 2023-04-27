import { createClient } from "@supabase/supabase-js"
import * as cheerio from "cheerio"
import * as dotenv from "dotenv"
import { Document } from "langchain/document"
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio"
import { OpenAIEmbeddings } from "langchain/embeddings/openai"
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter"
import { SupabaseVectorStore } from "langchain/vectorstores/supabase"

dotenv.config()

const BASE_URL = "https://superteam.fun"
const INSTAGRANTS_URL = `${BASE_URL}/instagrants`

const GRANT_LINK_CLASSNAME = ".notion-collection-card > .notion-link"
const GRANT_CARD_CLASSNAME = ".notion-collection-card"

const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const res = await fetch(INSTAGRANTS_URL)
  const html = await res.text()
  const $ = cheerio.load(html)

  getAndStoreGrantInfo($)
  getAndStoreGrantEmbeddingInfo($)
}

const getAndStoreGrantInfo = async ($: cheerio.CheerioAPI) => {
  try {
    const cards = $(GRANT_CARD_CLASSNAME)
    const elements: cheerio.Element[] = []
    cards.each((_, element) => {
      elements.push(element)
    })

    const cardInfo = await Promise.all(
      elements.map((ele) => getGrantCardInfo($, ele))
    )
    await supabaseClient.from("tbl_instagrants").insert(cardInfo)
  } catch (error) {
    console.error(error)
  }
}

const getGrantCardInfo = ($: cheerio.CheerioAPI, element: cheerio.Element) => {
  try {
    const name = $(element)
      .find(".notion-semantic-string > span")
      .first()
      .text()

    const status = $(element)
      .find(
        ".notion-collection-card__property-list .notion-collection-card__property"
      )
      .eq(0)
      .text()

    const reward = $(element)
      .find(
        ".notion-collection-card__property-list .notion-collection-card__property"
      )
      .eq(1)
      .text()

    const org = $(element)
      .find(
        ".notion-collection-card__property-list .notion-collection-card__property"
      )
      .eq(2)
      .text()

    const tags: string[] = []
    const tagEles = $(element)
      .find(
        ".notion-collection-card__property-list .notion-collection-card__property"
      )
      .eq(3)
      .find(".notion-pill")
    tagEles.each((_, ele) => {
      tags.push($(ele).text())
    })

    return {
      name,
      status,
      reward,
      org,
      tags,
      image: "",
    }
  } catch (error) {
    return null
  }
}

const getAndStoreGrantEmbeddingInfo = async ($: cheerio.CheerioAPI) => {
  try {
    const links = $(GRANT_LINK_CLASSNAME)
    const urls: string[] = []

    links.each((_, element) => {
      const url = element.attribs["href"]
      urls.push(url)
    })

    const docs = await extraGrantsDoc(urls)
    if (!docs) {
      console.log("No docs")
    }

    await SupabaseVectorStore.fromDocuments(
      docs ?? [],
      new OpenAIEmbeddings({
        openAIApiKey: process.env.OPEN_AI_API_KEY,
      }),
      {
        client: supabaseClient,
        tableName: "tbl_documents",
        queryName: "tbl_match_documents",
      }
    )
  } catch (error) {
    console.error(error)
  }
}

const extraGrantDoc = async (url: string) => {
  try {
    const loader = new CheerioWebBaseLoader(url, {
      selector: ".super-content-wrapper",
    })
    const docs = await loader.load()

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 100,
    })

    const docOutput = await splitter.splitDocuments(docs)
    return docOutput
  } catch (error) {
    console.error(`[${url}]`, error)
    return null
  }
}

const extraGrantsDoc = async (urls: string[]) => {
  try {
    let results = await Promise.all(urls.map((url) => extraGrantDoc(url)))
    let docs: Document<Record<string, any>>[] = []
    results.forEach((doc) => {
      if (doc) {
        docs = docs.concat(doc)
      }
    })
    return docs
  } catch (error) {
    console.error(error)
    return null
  }
}

main().catch((err) => console.error(err))
