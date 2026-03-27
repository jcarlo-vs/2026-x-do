# AI Engineer Learning Progress

Track your progress through the AI Engineer Roadmap. Each checkbox represents a skill you need to master.
Mark items with [x] when completed.

---

## Section 0: Prerequisites

### 0.1 Backend Development Fundamentals
- [x] Comfortable building REST APIs from scratch
- [x] Understand HTTP methods, status codes, headers
- [x] Can design database schemas (relational + NoSQL)
- [x] Understand authentication (JWT, OAuth basics)
- [x] Familiar with middleware patterns

### 0.2 Development Environment
- [x] Git workflow (branches, PRs, merge conflicts)
- [ ] Docker basics (Dockerfile, docker-compose, volumes)
- [ ] Linux command line proficiency
- [x] VS Code or preferred IDE set up for Python + JS/TS

### 0.3 AI Provider Accounts Setup
- [ ] Create OpenAI account and get API key
- [ ] Create Anthropic account and get API key
- [ ] Create Google AI Studio account and get API key
- [ ] Understand API billing, usage limits, and free tiers
- [ ] Store API keys securely using environment variables (.env files)

---

## Section 1: Python for AI Development

### 1.1 Python Fundamentals
- [ ] Variables, data types, type hints
- [ ] Functions, decorators, generators
- [ ] Classes and OOP in Python
- [ ] List comprehensions, dict comprehensions
- [ ] Error handling (try/except, custom exceptions)
- [ ] f-strings, string formatting
- [ ] Working with JSON (json module, serialization/deserialization)
- [ ] File I/O (read/write files, CSV, JSON files)
- [ ] Context managers (with statement)

### 1.2 Python Environment & Package Management
- [ ] Create and manage virtual environments (venv)
- [ ] pip install, requirements.txt
- [ ] Poetry for dependency management (pyproject.toml)
- [ ] Understand Python versioning and compatibility
- [ ] Set up a clean project structure (src layout)

### 1.3 Async Python
- [ ] Understand async/await syntax
- [ ] asyncio basics (event loop, tasks, gather)
- [ ] Async HTTP requests with httpx
- [ ] When to use async vs sync (and why AI apps need async)
- [ ] Running multiple async API calls concurrently

### 1.4 Key Libraries
- [ ] requests — make HTTP calls to APIs
- [ ] httpx — async HTTP client (used by AI SDKs)
- [ ] pydantic — data validation and modeling
  - [ ] Define Pydantic models with field types
  - [ ] Nested models, optional fields, default values
  - [ ] Validators and field constraints
  - [ ] Model serialization (model_dump, model_json_schema)
- [ ] dotenv — load environment variables from .env

### 1.5 Building APIs with FastAPI
- [ ] Create a basic FastAPI app
- [ ] Define routes with path/query parameters
- [ ] Request/response models with Pydantic
- [ ] Error handling in FastAPI
- [ ] Dependency injection basics
- [ ] Streaming responses (StreamingResponse)

### 1.6 Hands-On: Build Your First AI API
- [ ] Create a FastAPI project with proper structure
- [ ] Implement an endpoint that calls OpenAI API
- [ ] Implement an endpoint that calls Anthropic API
- [ ] Return structured Pydantic-validated responses
- [ ] Handle streaming responses from LLMs
- [ ] Add error handling for API failures (rate limits, timeouts)
- [ ] Write basic tests for your endpoints
- [ ] Push to GitHub as your first project

---

## Section 2: LLM Fundamentals & API Usage

### 2.1 How LLMs Work (Conceptual)
- [ ] What is a large language model
- [ ] Tokens and tokenization (how text is split into tokens)
- [ ] Context windows (what fits, what doesn't)
- [ ] Temperature and sampling (randomness control)
- [ ] Top-p (nucleus sampling)
- [ ] What hallucinations are and why they happen
- [ ] Difference between training and inference

### 2.2 Chat Completions API
- [ ] Messages array structure (system, user, assistant roles)
- [ ] System prompts vs user prompts
- [ ] Conversation history (multi-turn conversations)
- [ ] Max tokens parameter and its impact
- [ ] Stop sequences

### 2.3 Streaming Responses
- [ ] Why streaming matters for UX
- [ ] Server-Sent Events (SSE) basics
- [ ] Implementing streaming with OpenAI SDK
- [ ] Implementing streaming with Anthropic SDK
- [ ] Forwarding streamed responses through your API

### 2.4 API Error Handling & Reliability
- [ ] Rate limit errors and retry strategies
- [ ] Exponential backoff implementation
- [ ] Timeout handling for slow responses
- [ ] Token limit exceeded errors
- [ ] API key rotation and security

### 2.5 Token Counting & Cost Estimation
- [ ] Use tiktoken to count tokens before sending
- [ ] Understand pricing per model (input vs output tokens)
- [ ] Calculate cost per request
- [ ] Build a simple cost tracker

### 2.6 Model Comparison
- [ ] GPT-4o — capabilities, pricing, best use cases
- [ ] Claude 3.5 Sonnet / Claude 4 Opus — capabilities, pricing, best use cases
- [ ] Gemini 2.0 — capabilities, pricing, best use cases
- [ ] Open-source models (Llama 3, Mistral, DeepSeek) — when to use them
- [ ] Understand the trade-offs: speed vs quality vs cost

### 2.7 Hands-On: Multi-Model Comparison Tool
- [ ] Set up a project that calls OpenAI, Anthropic, and Google APIs
- [ ] Send the same prompt to all 3 models
- [ ] Measure and display: response time, token count, cost
- [ ] Display responses side-by-side
- [ ] Add a simple web UI or CLI interface
- [ ] Push to GitHub

---

## Section 3: Prompt Engineering & Structured Output

### 3.1 Prompt Engineering Fundamentals
- [ ] Write effective system prompts
- [ ] Role-based prompting (assign the AI a persona/role)
- [ ] Few-shot prompting (provide examples in the prompt)
- [ ] Zero-shot vs few-shot — when to use each
- [ ] Chain-of-thought prompting (ask the AI to reason step-by-step)
- [ ] Prompt delimiters and formatting (XML tags, markdown, separators)

### 3.2 Advanced Prompt Techniques
- [ ] Prompt templates with variable injection (Jinja2 or f-strings)
- [ ] Prompt chaining (output of prompt A becomes input of prompt B)
- [ ] Self-consistency (ask the same question multiple ways, aggregate answers)
- [ ] Prompt versioning — track changes to prompts like code (why this matters)
- [ ] Writing prompts that produce consistent output formats

### 3.3 Structured Output — Pydantic Models
- [ ] Define Pydantic models for expected AI responses
- [ ] Nested models (e.g., a Report containing a list of Findings)
- [ ] Optional fields and defaults for incomplete AI responses
- [ ] Enum constraints (restrict AI to specific categories)
- [ ] Custom validators on AI output fields

### 3.4 Structured Output — Libraries & APIs
- [ ] instructor library — patch OpenAI/Anthropic for structured output
  - [ ] Install and configure instructor
  - [ ] Extract structured data from unstructured text
  - [ ] Handle retries when AI returns malformed data
- [ ] OpenAI response_format (native structured output mode)
- [ ] Anthropic tool-use trick for structured output
- [ ] JSON Schema definition for AI responses

### 3.5 Handling Edge Cases
- [ ] What to do when AI returns malformed JSON
- [ ] Retry strategies for structured output failures
- [ ] Fallback responses when extraction fails
- [ ] Partial extraction (get what you can, flag what's missing)
- [ ] Logging failed extractions for improvement

### 3.6 Hands-On: Document Intelligence Service
- [ ] Design Pydantic models for: email extraction, contract extraction, article extraction
- [ ] Build a FastAPI service that accepts any text input
- [ ] Extract entities, dates, action items, and sentiment
- [ ] Use instructor for reliable structured extraction
- [ ] Handle malformed responses gracefully
- [ ] Add tests with diverse input types (messy emails, formal contracts, casual articles)
- [ ] Push to GitHub

---

## Section 4: AI SDKs & Multi-Model Strategies

### 4.1 OpenAI Python SDK Deep Dive
- [ ] Chat completions (sync and async)
- [ ] Streaming responses
- [ ] Function calling / tool use
- [ ] Structured output with response_format
- [ ] Image input (vision capabilities)
- [ ] Error handling and retries

### 4.2 Anthropic Python SDK Deep Dive
- [ ] Messages API (sync and async)
- [ ] Streaming responses
- [ ] Tool use (function calling)
- [ ] System prompts and prompt caching
- [ ] Extended thinking (Claude's reasoning mode)
- [ ] Error handling and retries

### 4.3 Google GenAI SDK
- [ ] Gemini API basics
- [ ] Multi-modal inputs (text + images)
- [ ] Streaming and function calling
- [ ] When to choose Gemini over OpenAI/Anthropic

### 4.4 Vercel AI SDK (TypeScript)
- [ ] Set up Vercel AI SDK in a Next.js project
- [ ] useChat and useCompletion hooks
- [ ] Streaming UI components
- [ ] Multi-provider support
- [ ] When to use TypeScript SDK vs Python SDK

### 4.5 Multi-Model Architecture Patterns
- [ ] Model routing — classify request complexity, pick the right model
- [ ] Fallback chains — primary → secondary → tertiary model
- [ ] Cost optimization — cheap models for simple tasks
- [ ] Quality vs speed vs cost trade-off matrix
- [ ] A/B testing different models on the same task
- [ ] Embedding models vs generation models (different providers for each)

### 4.6 Direct SDK vs Frameworks
- [ ] Understand why many production teams skip LangChain
- [ ] When a framework helps vs when it adds unnecessary complexity
- [ ] Building thin wrappers around SDKs for your specific needs

### 4.7 Hands-On: AI Router Service
- [ ] Build a FastAPI service that receives user queries
- [ ] Implement a complexity classifier (simple/medium/complex)
- [ ] Route simple queries to GPT-4o-mini or Claude Haiku
- [ ] Route complex queries to GPT-4o or Claude Sonnet/Opus
- [ ] Implement fallback chains (if primary fails, try secondary)
- [ ] Track and log: model used, latency, token count, cost per request
- [ ] Build a simple dashboard showing cost savings
- [ ] Push to GitHub

---

## Section 5: Embeddings & Vector Databases

### 5.1 Embedding Fundamentals
- [ ] What embeddings are (text → dense vector)
- [ ] Why embeddings capture semantic meaning
- [ ] Cosine similarity — measuring how similar two texts are
- [ ] Euclidean distance vs cosine similarity
- [ ] Embedding dimensions (384, 768, 1536, 3072) and trade-offs

### 5.2 Embedding Models
- [ ] OpenAI text-embedding-3-small and text-embedding-3-large
- [ ] Cohere embed models
- [ ] Open-source embedding models (sentence-transformers)
- [ ] Comparing embedding quality across models
- [ ] Cost comparison across providers

### 5.3 Text Chunking Strategies
- [ ] Why you need to chunk text (context window limits)
- [ ] Fixed-size chunking (by character count or token count)
- [ ] Recursive text splitting (split by paragraphs, then sentences)
- [ ] Semantic chunking (split by meaning)
- [ ] Chunk overlap and why it matters
- [ ] Choosing chunk size for your use case

### 5.4 Vector Databases — Qdrant
- [ ] Install and run Qdrant (Docker)
- [ ] Create collections with proper config
- [ ] Insert vectors with metadata (payloads)
- [ ] Query by similarity
- [ ] Metadata filtering
- [ ] Understand indexing and performance

### 5.5 Vector Databases — pgvector
- [ ] Install pgvector extension on PostgreSQL
- [ ] Create tables with vector columns
- [ ] Insert and query vectors with SQL
- [ ] Indexing strategies (IVFFlat, HNSW)
- [ ] When to choose pgvector over standalone vector DBs

### 5.6 Vector Databases — Chroma & Others
- [ ] Chroma for quick prototyping
- [ ] Pinecone for managed cloud
- [ ] FAISS for local experiments
- [ ] Choosing the right vector DB for your project

### 5.7 Advanced Search Techniques
- [ ] Hybrid search — combine vector similarity with keyword matching (BM25)
- [ ] Metadata filtering (filter by date, category, source before similarity search)
- [ ] Embedding caching (don't re-embed the same text)
- [ ] Batch embedding for efficiency

### 5.8 Hands-On: Semantic Search Engine
- [ ] Choose a dataset (documents, articles, or your own notes)
- [ ] Implement text chunking with overlap
- [ ] Generate embeddings using OpenAI and one open-source model
- [ ] Store in Qdrant with metadata
- [ ] Implement hybrid search (vector + keyword)
- [ ] Add metadata filtering (by date, source, category)
- [ ] Implement embedding caching
- [ ] Compare search quality across embedding models
- [ ] Build a simple search UI or API
- [ ] Push to GitHub

---

## Section 6: RAG Systems & Knowledge Architectures

### 6.1 Basic RAG Pipeline
- [ ] Understand the full RAG flow (question → embed → search → retrieve → generate)
- [ ] Implement a basic RAG pipeline end-to-end
- [ ] Document ingestion (PDF, text, markdown)
- [ ] Chunking documents for RAG
- [ ] Embedding and storing chunks
- [ ] Retrieving relevant chunks for a query
- [ ] Building a prompt with retrieved context
- [ ] Generating an answer with citations

### 6.2 Document Processing
- [ ] Parse PDFs (PyPDF2, pdfplumber, or unstructured)
- [ ] Parse HTML/web pages
- [ ] Parse markdown files
- [ ] Handle tables and structured content within documents
- [ ] Clean and preprocess text before chunking

### 6.3 Retrieval Quality
- [ ] Retrieval ranking — how to rank retrieved chunks by relevance
- [ ] Context window management — fitting the right amount of context
- [ ] Hallucination reduction techniques (instruction to only use provided context)
- [ ] Measuring retrieval quality (precision, recall)

### 6.4 Advanced RAG Techniques
- [ ] Query transformation — rewrite user queries for better retrieval
- [ ] Multi-query RAG — generate multiple search queries from one question
- [ ] Re-ranking — use Cohere Rerank or cross-encoder to re-order results
- [ ] Parent-child chunking — retrieve small chunks, return parent sections
- [ ] Contextual compression — compress retrieved docs to save context space
- [ ] Recursive retrieval — retrieve, then retrieve again based on initial results

### 6.5 Knowledge Systems / "Second Brains"
- [ ] Understand the "Context Pack" concept (curated knowledge bundles)
- [ ] Build subject-area expert systems (beyond basic "chat with docs")
- [ ] Design domain-specific chunking strategies
- [ ] Implement citation and source tracking
- [ ] Allow domain experts to validate and refine the knowledge base
- [ ] Maintain and update knowledge bases over time (re-indexing strategies)

### 6.6 Knowledge Graph Augmented RAG
- [ ] What is a knowledge graph (entities + relationships)
- [ ] Extract entities and relationships from documents using LLMs
- [ ] Store in a graph structure (NetworkX, Neo4j, or custom)
- [ ] Combine graph traversal with vector search
- [ ] When knowledge graphs help vs when they're overkill

### 6.7 Hands-On: Domain "Second Brain" System
- [ ] Pick a specific domain (legal, medical, software architecture, etc.)
- [ ] Build a document ingestion pipeline (accept PDFs, web pages, markdown)
- [ ] Implement advanced chunking with metadata extraction
- [ ] Create "Context Packs" — curated knowledge bundles per sub-topic
- [ ] Implement multi-query RAG with re-ranking
- [ ] Add citation tracking (every answer shows its sources)
- [ ] Build a validation interface for domain experts to review/correct
- [ ] Measure retrieval accuracy and answer quality
- [ ] Deploy as an API with a simple frontend
- [ ] Push to GitHub — THIS IS PORTFOLIO PROJECT #1

---

## Section 7: AI Agents & Tool Calling

### 7.1 Tool Calling Fundamentals
- [ ] What tool calling / function calling is
- [ ] How the LLM "decides" to call a tool (it outputs a structured tool call)
- [ ] Tool schemas — defining tools with JSON Schema
- [ ] The tool calling loop: user → LLM → tool call → execute → LLM → response
- [ ] Parallel tool calls (LLM requests multiple tools at once)

### 7.2 OpenAI Function Calling
- [ ] Define functions/tools in OpenAI format
- [ ] Handle tool call responses
- [ ] Execute tools and feed results back
- [ ] Multi-turn tool calling conversations

### 7.3 Anthropic Tool Use
- [ ] Define tools in Anthropic format
- [ ] Handle tool_use content blocks
- [ ] Execute and return tool_result
- [ ] Differences from OpenAI's approach

### 7.4 MCP (Model Context Protocol)
- [ ] What MCP is and why it's becoming the standard
- [ ] MCP architecture — servers, clients, transports
- [ ] Use existing MCP servers (filesystem, database, web search)
- [ ] Build a custom MCP server for your own tools
- [ ] Connect MCP servers to AI agents
- [ ] MCP with stdio vs HTTP transport

### 7.5 Agent Patterns
- [ ] ReAct pattern (Reason → Act → Observe → repeat)
- [ ] Tool execution loops with termination conditions
- [ ] Multi-step tool chains (output of tool A feeds into tool B)
- [ ] Error handling in tool execution (tool fails, what now?)
- [ ] Tool selection strategies (how to help the LLM pick the right tool)
- [ ] Limiting tool calls (prevent infinite loops)

### 7.6 Agent Frameworks
- [ ] OpenAI Agents SDK — build agents with handoffs
- [ ] Anthropic native tool use — lean and direct
- [ ] LangGraph — graph-based agent workflows
- [ ] Understand when to use a framework vs build custom

### 7.7 Hands-On: MCP-Powered AI Agent
- [ ] Build or connect MCP servers for: database (read/write), filesystem, web search
- [ ] Create an agent that uses these tools via MCP
- [ ] Implement the ReAct loop (reason about what to do, call tools, observe results)
- [ ] Agent should: research a topic, store findings in DB, generate a structured report
- [ ] Handle tool errors gracefully
- [ ] Add conversation history so agent remembers context
- [ ] Push to GitHub

---

## Section 8: AI Workflow Orchestration

### 8.1 Workflow Patterns
- [ ] Sequential chains — output of step 1 feeds into step 2
- [ ] Parallel execution — run multiple LLM calls concurrently
- [ ] Conditional branching — route to different paths based on classification
- [ ] Map-reduce — split input, process pieces in parallel, combine results
- [ ] Human-in-the-loop — AI proposes, human reviews, AI continues

### 8.2 LangGraph
- [ ] Install and set up LangGraph
- [ ] Define state schemas
- [ ] Create nodes (each node is an AI step or tool call)
- [ ] Define edges and conditional edges
- [ ] Build a simple graph workflow
- [ ] Add persistence (checkpoint state between steps)
- [ ] Human-in-the-loop with LangGraph interrupts

### 8.3 Durable Workflow Engines
- [ ] Why you need durability for long-running AI pipelines
- [ ] Temporal basics for AI workflows
- [ ] Inngest for event-driven AI pipelines
- [ ] When to use LangGraph vs Temporal vs custom async Python

### 8.4 Pipeline Design Patterns
- [ ] Extraction pipeline: Document → Classify → Extract Entities → Validate → Store
- [ ] Research pipeline: Query → Search → Summarize → Synthesize → Report
- [ ] Content pipeline: Brief → Draft → Review → Revise → Final
- [ ] Quality control: Generate → Evaluate → Regenerate if poor quality
- [ ] Fan-out/fan-in: split into subtasks, process in parallel, merge results

### 8.5 Hands-On: Research Analyst Pipeline
- [ ] Design the workflow graph (query → search → extract → synthesize → summarize)
- [ ] Implement with LangGraph
- [ ] Generate multiple search queries from a single topic
- [ ] Search multiple sources in parallel
- [ ] Extract key findings from each source using structured output
- [ ] Synthesize findings into a structured report with citations
- [ ] Generate an executive summary
- [ ] Add error handling (what if a search fails? what if extraction is poor?)
- [ ] Push to GitHub — THIS IS PORTFOLIO PROJECT #2

---

## Section 9: Memory & Context Management

### 9.1 Memory Types
- [ ] Buffer memory — store recent conversation messages
- [ ] Summary memory — compress older messages into summaries
- [ ] Entity memory — extract and store facts about entities (people, places, concepts)
- [ ] Knowledge graph memory — store relationships between entities
- [ ] Implement each type in Python

### 9.2 Persistent Memory Storage
- [ ] Store conversation history in a database
- [ ] Store memory in vector database for semantic retrieval
- [ ] Store structured facts in PostgreSQL/Redis
- [ ] Session management — separate memory per user/conversation
- [ ] Memory cleanup and expiration strategies

### 9.3 Context Window Management
- [ ] Understand token budgets (how to allocate your context window)
- [ ] Priority allocation: instructions > recent messages > retrieved memory > history
- [ ] Sliding window — drop oldest messages when window fills up
- [ ] Summarize-and-drop — summarize old messages before removing them
- [ ] Context Packs — pre-built context bundles injected for specific tasks

### 9.4 Context Compression Techniques
- [ ] Summarize older conversation turns
- [ ] Extract key facts from long conversations
- [ ] Compress retrieved documents before injecting as context
- [ ] Token counting to stay within budget

### 9.5 Hands-On: AI Assistant with Persistent Memory
- [ ] Build a chatbot with conversation history stored in a database
- [ ] Implement buffer + summary memory (recent messages in full, older ones summarized)
- [ ] Extract and store user preferences as entity memory
- [ ] Build a user profile that grows over time
- [ ] Implement context budgeting — prioritize recent + relevant within token limits
- [ ] Test with long conversations (20+ turns) to verify memory management works
- [ ] Push to GitHub

---

## Section 10: Guardrails, Safety & Evaluation

### 10.1 Input Safety
- [ ] Prompt injection — what it is and how to prevent it
- [ ] Input validation — sanitize user input before sending to LLM
- [ ] Content moderation APIs (OpenAI moderation, Anthropic's approach)
- [ ] PII detection — identify and redact personal information
- [ ] Rate limiting per user to prevent abuse

### 10.2 Output Safety
- [ ] Output validation — ensure AI responses meet your requirements
- [ ] Response filtering — block harmful, off-topic, or low-quality responses
- [ ] Content policy enforcement — restrict AI to allowed topics
- [ ] Guardrails as middleware — input/output validation as a pipeline step
- [ ] Guardrails AI library setup and usage

### 10.3 Evaluation Fundamentals
- [ ] Why you need to evaluate AI systems (you can't improve what you don't measure)
- [ ] Golden datasets — curate 50+ test cases with expected outputs
- [ ] Automated evaluation — run tests on every prompt change
- [ ] Hallucination scoring — measure how often the AI makes things up
- [ ] Relevance scoring — does the AI answer the actual question?
- [ ] Completeness scoring — did the AI cover all important points?

### 10.4 Advanced Evaluation Techniques
- [ ] LLM-as-judge — use one LLM to evaluate another's output
- [ ] Regression testing for prompts (did the new prompt break old test cases?)
- [ ] A/B testing prompts in production
- [ ] Human evaluation pipelines (for cases that need manual review)
- [ ] Tracking evaluation metrics over time

### 10.5 Evaluation Tools
- [ ] OpenAI Evals framework
- [ ] Braintrust for evals + monitoring
- [ ] Custom eval harness in Python (pytest-based)

### 10.6 Hands-On: Evaluation + Safety Pipeline
- [ ] Build guardrails middleware (validates all inputs and outputs)
- [ ] Implement prompt injection detection
- [ ] Implement PII detection and redaction
- [ ] Create a golden dataset of 50+ test cases for your domain
- [ ] Build automated evaluation that runs on prompt changes
- [ ] Implement LLM-as-judge for quality scoring
- [ ] Create a simple dashboard showing quality metrics over time
- [ ] Push to GitHub

---

## Section 11: AI Observability & Monitoring

### 11.1 Logging for AI Systems
- [ ] What to log: request, response, model, tokens, latency, cost
- [ ] What NOT to log: PII, sensitive user data, full conversation history
- [ ] Structured logging with Python (structlog or loguru)
- [ ] Log storage and querying

### 11.2 Tracing Multi-Step Workflows
- [ ] What distributed tracing is (spans, traces, parent-child relationships)
- [ ] Tracing an AI pipeline: which step failed? which was slow?
- [ ] OpenTelemetry basics for AI applications
- [ ] Adding custom spans for LLM calls

### 11.3 Cost Tracking
- [ ] Track cost per request (input tokens × price + output tokens × price)
- [ ] Track cost per user, per feature, per model
- [ ] Set up budget alerts (daily/weekly/monthly limits)
- [ ] Cost attribution — which features cost the most?

### 11.4 Quality Monitoring
- [ ] Detect drift in AI output quality over time
- [ ] User feedback loops (thumbs up/down, corrections)
- [ ] Automated quality checks on a sample of production responses
- [ ] Alerting on quality drops

### 11.5 Observability Tools
- [ ] Langfuse — set up and instrument an app
  - [ ] Install Langfuse SDK
  - [ ] Add traces to your AI calls
  - [ ] View traces in Langfuse dashboard
  - [ ] Set up cost tracking
- [ ] LangSmith — overview and when to use it
- [ ] Custom observability with OpenTelemetry

### 11.6 Hands-On: Instrument an AI Application
- [ ] Take one of your previous projects (RAG system or agent)
- [ ] Add Langfuse tracing to all LLM calls
- [ ] Implement cost tracking per request
- [ ] Add latency monitoring
- [ ] Build a quality dashboard (response quality scores over time)
- [ ] Set up alerts for: cost spikes, latency increases, quality drops
- [ ] Push to GitHub

---

## Section 12: Scaling & Production Patterns

### 12.1 AI-Specific Caching
- [ ] Semantic caching — cache responses for similar (not just identical) queries
- [ ] Implement semantic cache with embeddings + similarity threshold
- [ ] Prompt caching — Anthropic prompt caching, OpenAI cached completions
- [ ] Embedding caching — don't re-embed text you've already embedded
- [ ] Cache invalidation — when to expire cached AI responses
- [ ] Measure cache hit rates and cost savings

### 12.2 Queue-Based AI Processing
- [ ] Why queues matter for AI (long-running tasks shouldn't block the API)
- [ ] Redis Queue (RQ) for Python background jobs
- [ ] Celery for distributed task processing
- [ ] BullMQ for Node.js/TypeScript apps
- [ ] Implement: user submits request → queue → worker processes → result stored → user notified

### 12.3 Production Integration Patterns
- [ ] Webhook-driven AI — trigger AI processing on external events
- [ ] Background processing for heavy AI tasks
- [ ] Rate limiting AI endpoints (per user, per API key)
- [ ] Graceful degradation — what happens when OpenAI/Anthropic is down?
  - [ ] Implement model fallbacks
  - [ ] Return cached responses when possible
  - [ ] Show user-friendly error messages

### 12.4 Cost Optimization at Scale
- [ ] Token budgeting — set max tokens per request type
- [ ] Prompt compression — shorten prompts without losing quality
- [ ] Model tiering — route cheap tasks to cheap models
- [ ] Batch processing — collect non-urgent requests, process in bulk
- [ ] Calculate cost savings from each optimization

### 12.5 Hands-On: Production-Optimized AI System
- [ ] Take a previous project and add production patterns
- [ ] Implement semantic caching (target: 60%+ reduction in API calls)
- [ ] Add queue-based processing for heavy tasks
- [ ] Implement graceful fallbacks for provider outages
- [ ] Add cost tracking with daily budget limits
- [ ] Load test to verify it handles concurrent requests
- [ ] Push to GitHub

---

## Section 13: Full AI Applications

### 13.1 Study Architecture Patterns
- [ ] Pattern 1: Domain Expert System (RAG + Context Packs + structured output)
- [ ] Pattern 2: AI Workflow Platform (multi-step pipelines + HITL)
- [ ] Pattern 3: AI-Powered Data Platform (extraction + enrichment + search)
- [ ] Compare these patterns — when to use which

### 13.2 Production Architecture Components
- [ ] Frontend layer (Next.js / React)
- [ ] Backend API layer (FastAPI / Node.js)
- [ ] AI orchestration layer (LangGraph / custom)
- [ ] Multi-provider LLM integration
- [ ] Vector database layer
- [ ] Cache layer (Redis + semantic cache)
- [ ] Observability layer (Langfuse)
- [ ] Queue layer (Redis Queue / BullMQ)
- [ ] How these components communicate (REST, events, queues)

### 13.3 Hands-On: Build a Full AI Application
- [ ] Choose one of the 3 architecture patterns
- [ ] Design the system architecture (draw it out)
- [ ] Implement each layer
- [ ] Integrate all components end-to-end
- [ ] Add observability, caching, and error handling
- [ ] Write integration tests
- [ ] Document the architecture for your portfolio
- [ ] Push to GitHub — THIS IS PORTFOLIO PROJECT #3

---

## Section 14: System Design & Deployment

### 14.1 AI System Design
- [ ] Design a typical AI system (API Gateway → AI Service → Vector DB → LLM)
- [ ] Async processing and background job architecture
- [ ] Queue systems for AI workloads
- [ ] Streaming response architecture (SSE through the full stack)
- [ ] Multi-tenant design (isolate data and costs between tenants)

### 14.2 Deployment Strategies
- [ ] Dockerize your AI application (multi-stage builds, slim images)
- [ ] docker-compose for local development (app + vector DB + Redis + Postgres)
- [ ] Environment variable management in production
- [ ] Blue-green deployment for AI model/prompt changes
- [ ] Feature flags for prompt versions (gradual rollout)

### 14.3 Cloud Deployment
- [ ] AWS deployment (EC2/ECS/Lambda for AI services)
- [ ] GCP deployment (Cloud Run for containerized AI apps)
- [ ] Vercel for frontend + edge functions
- [ ] Modal for Python AI workloads (serverless GPU)
- [ ] Fly.io for global low-latency deployment
- [ ] Choose the right platform for your use case

### 14.4 CI/CD for AI Systems
- [ ] GitHub Actions for AI app deployment
- [ ] Run eval tests in CI (fail deployment if quality drops)
- [ ] Prompt regression tests as part of the pipeline
- [ ] Automated cost monitoring in CI
- [ ] Infrastructure as Code basics (Terraform or Pulumi)

### 14.5 Hands-On: Deploy a Full AI SaaS
- [ ] Dockerize your full AI application
- [ ] Set up CI/CD with GitHub Actions
- [ ] Include prompt regression tests in CI
- [ ] Deploy to a cloud platform
- [ ] Set up monitoring and alerting in production
- [ ] Add multi-tenant support (at least 2 isolated tenants)
- [ ] Cost controls (daily budget, per-tenant limits)
- [ ] Get a public URL that real users can access
- [ ] Push to GitHub — THIS IS PORTFOLIO PROJECT #4

---

## Section 15: Advanced AI Engineering

### 15.1 Fine-Tuning Fundamentals
- [ ] What fine-tuning is vs prompting vs RAG
- [ ] When to fine-tune (and when NOT to — most tasks don't need it)
- [ ] Training data preparation (JSONL format, quality over quantity)
- [ ] Fine-tuning with OpenAI API
- [ ] LoRA — lightweight fine-tuning without full model retraining
- [ ] Evaluating fine-tuned models against base models

### 15.2 Model Optimization
- [ ] Quantization — making models smaller and faster
- [ ] Distillation — train a small model on a large model's outputs
- [ ] When quantization/distillation makes sense (cost, latency, privacy)

### 15.3 Local Models
- [ ] Set up Ollama for local model development
- [ ] Run Llama 3, Mistral, and other open models locally
- [ ] When to use local models vs API models
- [ ] Model serving with vLLM for production

### 15.4 Alignment & Safety Concepts
- [ ] RLHF (Reinforcement Learning from Human Feedback) — conceptual
- [ ] DPO (Direct Preference Optimization) — conceptual
- [ ] Why these matter for understanding model behavior

### 15.5 Multi-Modal AI
- [ ] Vision + text (image understanding, document OCR)
- [ ] Audio + text (transcription, voice interactions)
- [ ] Building multi-modal pipelines

### 15.6 Advanced Tools
- [ ] HuggingFace — explore and use open-source models
- [ ] Unsloth — fast fine-tuning
- [ ] Together AI — fine-tuning and inference API
- [ ] vLLM — high-performance model serving

### 15.7 Hands-On: Fine-Tune a Model
- [ ] Prepare a training dataset (at least 100 high-quality examples)
- [ ] Fine-tune a model using OpenAI API or Unsloth
- [ ] Evaluate: compare fine-tuned vs base model on your task
- [ ] Document when fine-tuning helped and when prompting was enough
- [ ] Push to GitHub

---

## Portfolio & Job Readiness

### Portfolio Project Checklist

- [ ] **Project 1: Domain Expert "Second Brain"** (from Section 6.7)
  - [ ] Deployed and accessible via URL
  - [ ] README with architecture diagram
  - [ ] Demo video or screenshots
  - [ ] Quality metrics documented

- [ ] **Project 2: Multi-Step AI Workflow Engine** (from Section 8.5)
  - [ ] Deployed and accessible via URL
  - [ ] README with workflow diagram
  - [ ] Demo video or screenshots
  - [ ] Observability dashboard screenshot

- [ ] **Project 3: Full AI Application** (from Section 13.3)
  - [ ] Deployed and accessible via URL
  - [ ] README with system architecture diagram
  - [ ] Demo video or screenshots
  - [ ] Production patterns documented (caching, queues, fallbacks)

- [ ] **Project 4: Deployed AI SaaS** (from Section 14.5)
  - [ ] Live URL with real users
  - [ ] CI/CD pipeline visible in GitHub Actions
  - [ ] Cost controls and monitoring in place
  - [ ] README with deployment architecture

- [ ] **Project 5 (Optional): Production AI Agent with MCP** (from Section 7.7)
  - [ ] Multi-model routing implemented
  - [ ] Persistent memory across sessions
  - [ ] Full guardrails and eval pipeline
  - [ ] README with agent architecture

### GitHub Profile
- [ ] All projects have clean READMEs with architecture diagrams
- [ ] Each project has a clear "What I Built" and "What I Learned" section
- [ ] GitHub profile README showcases your AI engineering focus
- [ ] Projects show progression from basics to production systems

### Resume & Job Applications
- [ ] Update resume to highlight AI engineering skills
- [ ] Frame projects in terms of business impact (cost savings, quality improvements)
- [ ] Practice explaining your architecture decisions
- [ ] Be ready to discuss: RAG, agents, structured output, multi-model routing, production patterns
- [ ] Apply to AI Engineer roles with confidence

---

## Timeline Checkpoints

- [ ] **Month 1-2 Complete**: Sections 0-4 done — can make API calls, get structured output, use multiple models
- [ ] **Month 3-4 Complete**: Sections 5-8 done — can build real AI systems (RAG, agents, workflows)
- [ ] **Month 5-6 Complete**: Sections 9-12 done — can ship production-grade AI systems
- [ ] **Month 7-8 Complete**: Sections 13-15 done — can architect and deploy full AI applications
- [ ] **Month 9+ Complete**: Portfolio projects polished and deployed — job-ready
