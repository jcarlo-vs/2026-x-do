# AI Engineer Roadmap

## Goal
Become an AI engineer who can:
- understand how LLMs like ChatGPT and Claude work
- integrate AI into backend and frontend systems
- build RAG systems with vectors and retrieval
- use tool calling and AI agents safely
- evaluate and improve AI systems in production

## Best Path For Your Stack
Your stack:
- React
- Next.js
- Vue
- Node.js
- PostgreSQL
- MongoDB

Best path:
1. Learn how LLMs work
2. Learn raw API integration in Node.js
3. Learn prompting and structured outputs
4. Learn embeddings, vectors, and RAG
5. Learn backend architecture for AI systems
6. Learn tool calling
7. Learn AI agents
8. Learn LangChain and LangGraph
9. Learn evals and monitoring
10. Learn fine-tuning
11. Learn automation workflows

## Phase 1: Understand LLM Basics
Learn:
- tokens
- context windows
- transformers
- attention
- embeddings
- inference vs training vs fine-tuning
- hallucinations and limitations

Watch first:
1. Andrej Karpathy - Intro to Large Language Models
2. 3Blue1Brown - Attention in Transformers
3. Hugging Face LLM Course

Outcome:
- You can explain how ChatGPT-like systems work at a high level

## Phase 2: Learn Raw API Integration First
Do this before LangChain.

Learn:
- chat completions / responses APIs
- system prompts
- structured JSON output
- streaming
- function or tool calling
- retries, timeouts, rate limits
- token and cost awareness

Build:
1. simple chat endpoint in Node.js
2. streaming chat in Next.js
3. JSON extraction endpoint
4. one tool-calling backend endpoint

## Phase 3: Learn Prompt Engineering
Learn:
- clear system prompts
- prompt templates
- output constraints
- examples / few-shot prompting
- prompt versioning
- testing prompts with real inputs

Build:
- summarizer
- classifier
- extractor
- rewriting endpoint

## Phase 4: Learn Embeddings, Vectors, and RAG
This is one of the most important parts.

Learn:
- what embeddings are
- chunking
- vector similarity
- metadata filters
- retrieval pipelines
- reranking
- grounded answers with citations

Use:
- PostgreSQL
- pgvector
- Node.js
- Next.js

Build:
1. upload docs
2. chunk docs
3. create embeddings
4. store in PostgreSQL with pgvector
5. retrieve relevant chunks
6. answer with citations

Important:
- For many real apps, RAG is more useful than fine-tuning

## Phase 5: Learn AI Backend Architecture
Learn:
- queues and async jobs
- caching
- conversation state
- audit logs
- prompt/model versioning
- tracing and observability
- human review and fallbacks

Good tools:
- PostgreSQL
- BullMQ
- Redis if needed

Build:
- production-style AI service layer
- job-based document ingestion
- logging and tracing for AI runs

## Phase 6: Learn Tool Calling and AI Agents
Do this after APIs and RAG.

Learn:
- single-tool calling
- multi-tool workflows
- planning vs direct execution
- memory/state
- approval flows
- stop conditions
- when not to use agents

Build in order:
1. single tool call
2. multiple internal backend tools
3. support copilot
4. approval-based internal agent
5. workflow-style agent with retries

Agent rule:
- use agents when tool selection and reasoning help
- do not use agents when deterministic code is enough

## Phase 7: Learn LangChain and LangGraph
Only after you understand raw APIs.

Learn:
- prompt templates
- retrievers
- chains
- agents
- graph workflows

Rule:
- raw API first
- LangChain second
- LangGraph when workflows get complex

## Phase 8: Learn Evals and Monitoring
This is mandatory for professional AI work.

Learn:
- eval datasets
- regression tests
- prompt comparison
- model comparison
- latency and cost measurement
- quality scoring
- safety checks

Build:
- small eval harness
- compare prompts and models
- track quality over time

Rule:
- do not trust vibes
- evaluate behavior

## Phase 9: Learn Fine-Tuning
Only after prompts, RAG, and evals.

Use fine-tuning for:
- narrow classification
- extraction
- stable formatting
- consistent style
- reducing prompt size on repeated tasks

Do not use fine-tuning for:
- replacing retrieval
- fixing bad product design
- solving every hallucination issue

Build:
- one narrow fine-tuning project
- example: support ticket classification

## Phase 10: Learn AI Automation
Learn:
- scheduled workflows
- event-driven pipelines
- document processing
- ticket triage
- summaries and reporting
- CRM enrichment
- approval workflows

Build:
- daily support summary
- ticket triage pipeline
- meeting note summarizer
- contract extraction workflow

Rule:
- automation is often more valuable than chat

## Suggested Project Order
1. Basic AI chat app
2. Structured output service
3. RAG knowledge assistant
4. AI support copilot
5. Tool-calling internal agent
6. Multi-step workflow agent
7. Eval dashboard
8. Fine-tuned narrow task

## What To Focus On In Your Stack
Frontend:
- chat UI
- streaming
- citations
- file upload
- approval UI

Backend:
- AI API wrappers
- retrieval services
- tool execution layer
- queues
- eval pipelines
- observability

PostgreSQL:
- pgvector
- document chunks
- message history
- traces and metadata

MongoDB:
- use mainly if your existing app already depends on it
- PostgreSQL + pgvector is the cleaner starting point for learning

## 3-Month Order
Month 1:
- LLM basics
- Node.js AI integration
- prompting
- streaming chat app

Month 2:
- embeddings
- pgvector
- RAG app
- retrieval improvements

Month 3:
- tool calling
- AI agents
- evals and monitoring
- fine-tuning and automation basics

## What To Avoid
- starting with LangChain too early
- starting with fine-tuning too early
- building agents before simple tool calling
- shipping without evals
- building AI features without retries, logs, and fallbacks

## Final Advice
Think like a backend engineer building AI systems:
- choose between prompting, RAG, fine-tuning, and automation carefully
- design for failure modes
- measure quality
- control cost and latency
- build safe production workflows
