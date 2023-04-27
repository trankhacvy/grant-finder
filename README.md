# AI-Powered instagrants finder

The AI-powered grants finder that enables builders to search for equity-free funding opportunities to help them create valuable products. Powered by ChatGPT, a state-of-the-art language model, the website provides an intuitive chat interface that allows users to describe their project and receive personalized grant recommendations.

## How it's built
- Parse data from https://superteam.fun/instagrants.
- Using OpenAI's embeddings API to create embeddings for each grant information.
- Storing the embeddings in Postgres using the pgvector extension.
- Getting a user's question.
- Query the Postgres database for the most relevant documents related to the question.
- Inject these documents as context for GPT-3.5 to reference in its answer.
- Streaming the results back to the user in realtime.
