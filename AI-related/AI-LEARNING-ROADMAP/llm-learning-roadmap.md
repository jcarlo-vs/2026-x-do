# 🧠 The Complete LLM Learning Roadmap

> A step-by-step journey from "what is an LLM?" to "I can fine-tune one on my company's data."
> Follow this in order. Don't skip ahead — each phase builds on the last.

---

## 📍 How to Use This Roadmap

- ✅ Complete phases **in order** — concepts build on each other
- 🎯 Each phase has a **goal** so you know when you're "done"
- ⏱️ Time estimates assume ~1 hour/day of focused study
- 🛠️ Every phase ends with a **hands-on exercise** — don't skip these

---

# PHASE 1: The Big Picture (Week 1)

**Goal:** Understand what an LLM actually _is_, without any math.

## 1.1 What is an LLM, really?

An LLM (Large Language Model) is a program that, given some text, predicts **what word comes next**. That's it. Everything else — chatbots, coding assistants, summarizers — is built on top of that single ability.

**Mental model:** Imagine autocomplete on your phone, but trained on the entire internet. If you type "The capital of France is", it predicts "Paris" because it has seen that pattern billions of times.

**Key insight:** LLMs don't "know" things. They've learned statistical patterns in how words follow other words, and those patterns turn out to encode a surprising amount of world knowledge.

### 📚 Learn

- Watch: **3Blue1Brown — "But what is a GPT?"** (YouTube, ~25 min) — the best visual intro that exists
- Read: **"The Illustrated GPT-2"** by Jay Alammar

### 🎯 You're done when you can answer:

- What does "next-token prediction" mean?
- Why is it surprising that this simple task produces something that looks intelligent?

---

## 1.2 Tokens: The Atoms of LLMs

LLMs don't see words. They see **tokens** — chunks of text that can be whole words, parts of words, or even punctuation. "Hello world" might be 2 tokens. "Unbelievable" might be 3 tokens ("un", "believ", "able").

This is why LLMs are priced "per token" and why they have context limits like "128k tokens."

### 📚 Learn

- Play with: **OpenAI Tokenizer** (platform.openai.com/tokenizer) — paste text and see how it gets chunked
- Read: **"Let's build the GPT Tokenizer"** by Andrej Karpathy (YouTube)

### 🛠️ Hands-on

Count tokens for 5 different sentences in different languages. Notice how English is cheaper than, say, Japanese or code.

---

## 1.3 Prompts, Context Windows, and Inference

- **Prompt:** the input text you give the model
- **Context window:** how much text the model can "see" at once (e.g., 200k tokens)
- **Inference:** the process of actually running the model to get an output

### 🎯 You're done when you can explain these three terms to a friend.

---

# PHASE 2: Under the Hood (Weeks 2-3)

**Goal:** Understand _how_ the prediction actually happens. No heavy math yet — intuition first.

## 2.1 Neural Networks in 30 Minutes

Before LLMs, you need to understand the basic building block: a **neural network**.

A neural network is a bunch of simple math units ("neurons") connected in layers. Each connection has a **weight** (a number). You feed data in one end, math happens, a prediction comes out the other end. "Training" means adjusting all those weights until the predictions get good.

### 📚 Learn

- Watch: **3Blue1Brown — "Neural Networks"** series (4 videos, ~1 hour total) — this is legendary, watch all 4
- Key terms to understand: **weights, biases, activation function, loss, gradient descent, backpropagation**

### 🎯 You're done when you can explain:

- What a "weight" is
- What "training" means in one sentence
- Why we need a "loss function"

---

## 2.2 The Transformer Architecture

The Transformer is the specific type of neural network that makes modern LLMs work. It was introduced in a 2017 paper called **"Attention Is All You Need"**. Every major LLM today (GPT, Claude, Llama, Gemini) is a Transformer.

The key invention is **self-attention** — a mechanism that lets the model look at every word in the input and decide which other words are relevant when predicting the next one.

**Analogy:** When you read "The cat sat on the mat because it was tired," your brain knows "it" refers to "the cat," not "the mat." Attention is how the model does this.

### 📚 Learn

- Read: **"The Illustrated Transformer"** by Jay Alammar — go slow, read it 2-3 times
- Watch: **3Blue1Brown — "Attention in Transformers"**
- Read: **"The Annotated Transformer"** (Harvard NLP) — only if you're feeling brave

### 🎯 You're done when you can draw (roughly) the flow:

```
Input text → Tokens → Embeddings → Transformer layers → Output probabilities → Next token
```

---

## 2.3 Embeddings: Turning Words into Numbers

A neural network can't process the word "dog." It needs numbers. An **embedding** is a list of numbers (say, 1024 of them) that represents a word's "meaning" in a way the model can work with.

Cool property: similar words have similar embeddings. The vector for "king" minus "man" plus "woman" ≈ "queen". Meaning becomes math.

### 📚 Learn

- Read: **"The Illustrated Word2Vec"** by Jay Alammar
- Play: **TensorFlow Embedding Projector** — visually explore word embeddings

### 🛠️ Hands-on

Use OpenAI's or Cohere's embedding API to embed 10 sentences and find the most similar pair using cosine similarity. (We'll use this again in Phase 5 for RAG.)

---

# PHASE 3: How LLMs Are Trained (Week 4)

**Goal:** Understand the full training pipeline from raw internet text to a helpful chatbot.

## 3.1 Pretraining — The Expensive Part

This is where an LLM reads trillions of tokens of text (basically the whole internet + books + code) and learns to predict the next token. This step:

- Takes **months** on thousands of GPUs
- Costs **millions to hundreds of millions of dollars**
- Produces a "base model" that can complete text but isn't yet a helpful assistant

You will **never** do this yourself. But you need to understand it conceptually.

### 📚 Learn

- Watch: **Andrej Karpathy — "Intro to Large Language Models"** (1 hour, YouTube) — this entire video is gold
- Read: **"State of GPT"** talk by Karpathy (Microsoft Build 2023)

---

## 3.2 Post-Training: SFT, RLHF, DPO

A base model fresh from pretraining just continues text. If you type "What is the capital of France?" it might respond "What is the capital of Germany? What is the capital of Spain?" — it's pattern-matching, not assisting.

To turn it into a helpful assistant, it goes through **post-training**:

1. **SFT (Supervised Fine-Tuning):** Show the model thousands of example conversations (good prompts + good responses). It learns to imitate that style.
2. **RLHF (Reinforcement Learning from Human Feedback):** Humans rank pairs of outputs ("A is better than B"). A reward model is trained on those rankings. Then the LLM is tuned to produce outputs that score high on the reward model.
3. **DPO (Direct Preference Optimization):** A newer, simpler alternative to RLHF that skips the reward model step.

### 📚 Learn

- Watch: **Karpathy's "State of GPT"** (again, different sections)
- Read: **Hugging Face's "RLHF blog post"**
- Read: **"DPO paper explained"** — any beginner-friendly writeup

### 🎯 You're done when you can explain:

- Why a base model isn't useful out of the box
- What SFT does in one sentence
- Why RLHF was invented

---

# PHASE 4: Making LLMs Do What YOU Want (Weeks 5-6)

**Goal:** Learn the three ways to customize an LLM for your use case — and know which to use when.

> ⚡ **This is the most important phase for your original question.** When you say "train on my company's data," there are actually 3 options, and 90% of the time people reach for fine-tuning when they should have reached for RAG.

## 4.1 Option 1: Prompt Engineering (Start Here, Always)

Before fine-tuning or RAG, try **just writing a better prompt**. Modern LLMs are so capable that often all you need is:

- A clear system prompt describing the task and rules
- A few examples (few-shot prompting)
- Structured output format (JSON schema)

### 📚 Learn

- Read: **Anthropic's Prompt Engineering Guide** (docs.anthropic.com)
- Read: **OpenAI's Prompt Engineering Guide**
- Read: **"The Prompt Report"** (academic survey)

### 🛠️ Hands-on

Take a real task from your work and get an LLM to do it with _only_ a well-crafted prompt. No code changes, no fine-tuning.

---

## 4.2 Option 2: RAG (Retrieval-Augmented Generation) — Usually the Right Answer

**This is what you actually want for "teach the AI my company's rules / docs / knowledge base."**

**How it works:**

1. Chop your documents into chunks (paragraphs)
2. Embed each chunk into a vector (using an embedding model)
3. Store vectors in a **vector database** (Pinecone, Weaviate, Qdrant, Chroma, pgvector)
4. When a user asks a question, embed the question, find the most similar chunks, and **stuff those chunks into the LLM's prompt** as context
5. The LLM answers using that context

**Why it's better than fine-tuning for most cases:**

- ✅ Your data stays in a database, not baked into model weights
- ✅ Update your knowledge base instantly (just add new docs)
- ✅ Cheap — no GPU training
- ✅ You can show users the exact source document
- ✅ Works with any LLM (Claude, GPT, Llama, whatever)

### 📚 Learn

- Read: **"What is RAG?"** by Pinecone
- Watch: **"RAG from Scratch"** by LangChain (YouTube series)
- Build: a tiny RAG app with LangChain or LlamaIndex

### 🛠️ Hands-on Project

Take 10 PDFs (company docs, manuals, whatever) and build a chatbot that can answer questions about them. This is the single most valuable project you can do right now.

---

## 4.3 Option 3: Fine-Tuning — When RAG Isn't Enough

Fine-tuning means actually updating the model's weights on your data. Use this when:

- You need to teach the model a **new style, tone, or format** (not new facts)
- You need **domain-specific behavior** that prompting can't achieve
- You want a **smaller, cheaper model** to imitate a larger one for a narrow task

**Don't use fine-tuning when:**

- ❌ You just want the model to "know" your docs → use RAG
- ❌ Your data changes frequently → use RAG
- ❌ You want better accuracy on facts → use RAG

### Fine-tuning techniques, from heaviest to lightest:

1. **Full fine-tuning** — update every weight. Expensive, needs big GPUs, rarely necessary.
2. **LoRA (Low-Rank Adaptation)** — freeze the base model, only train small "adapter" matrices. 10-100x cheaper, nearly as good. **This is what most people use.**
3. **QLoRA** — LoRA on top of a quantized (compressed) model. Lets you fine-tune a 70B model on a single consumer GPU.

### 📚 Learn

- Read: **"LoRA Explained"** by Hugging Face
- Read: **"QLoRA paper explained"**
- Tutorial: **Hugging Face PEFT library docs**
- Tutorial: **Unsloth** (easiest way to fine-tune Llama/Mistral/Qwen on a free Colab GPU)

### 🛠️ Hands-on

Fine-tune a small model (Llama 3.2 1B or Qwen 2.5 0.5B) on a tiny custom dataset using **Unsloth** + free Google Colab. Even if the result is silly, you will understand the entire pipeline.

---

## 4.4 The Decision Tree

```
Is it a style/tone/format thing?          → Fine-tune (LoRA)
Is it "teach the AI my company's info"?   → RAG
Does the answer change often?              → RAG
Is prompting alone good enough?            → Prompt engineering
Do you need all of the above?              → All three together (it's common)
```

---

# PHASE 5: Practical Tools & Frameworks (Week 7)

**Goal:** Get comfortable with the ecosystem you'll actually use.

## 5.1 Core Libraries

- **Hugging Face Transformers** — the standard library for loading/using open models
- **Hugging Face PEFT** — for LoRA/QLoRA fine-tuning
- **Unsloth** — fastest way to fine-tune (beginner-friendly)
- **LangChain / LlamaIndex** — frameworks for building LLM apps (RAG, agents, tools)
- **Ollama** — run open models locally with one command
- **llama.cpp** — run quantized models on any hardware (including phones)

## 5.2 Vector Databases (for RAG)

- **Chroma** — easiest to start with, runs in-process
- **Qdrant / Weaviate** — production-grade, open source
- **pgvector** — Postgres extension, great if you already use Postgres
- **Pinecone** — managed, easy, paid

## 5.3 Platforms for Hosted Models

- **Anthropic API** (Claude)
- **OpenAI API** (GPT)
- **Cloudflare Workers AI** (cheap, edge)
- **Together.ai / Fireworks / Groq** (fast open-model hosting)
- **Hugging Face Inference Endpoints**

### 🛠️ Hands-on

Install **Ollama**, download a 3B model (like `llama3.2`), and chat with it from your terminal. You now have a completely offline LLM running on your machine.

---

# PHASE 6: Advanced Topics (Ongoing)

**Goal:** Keep leveling up. Pick what interests you.

## 6.1 Topics to Explore

- **Quantization** — how models get compressed from 16-bit to 4-bit to fit on small hardware
- **Inference optimization** — KV caching, speculative decoding, batching
- **Agents & tool use** — letting LLMs call APIs, run code, browse the web
- **Evaluation** — how to actually measure if your LLM app is any good (surprisingly hard)
- **Function calling / structured outputs** — making LLMs return reliable JSON
- **Multimodality** — models that handle images, audio, video
- **Small language models (SLMs)** — Phi, Gemma, SmolLM — surprisingly capable tiny models
- **On-device AI** — Apple Foundation Models, Gemini Nano, MLC LLM

## 6.2 Read the Classics

- **"Attention Is All You Need"** (2017) — the original Transformer paper
- **GPT-3 paper** ("Language Models are Few-Shot Learners")
- **InstructGPT paper** (where RLHF was applied to LLMs)
- **LoRA paper**
- **RAG paper** (original 2020 paper by Facebook AI)

---

# 🗺️ Summary: Your Learning Order

| Phase | Focus                                | Time    | Outcome                                     |
| ----- | ------------------------------------ | ------- | ------------------------------------------- |
| **1** | Big picture, tokens, prompts         | 1 week  | Can explain what an LLM does                |
| **2** | Neural nets, Transformers, attention | 2 weeks | Understand how it works internally          |
| **3** | Pretraining, SFT, RLHF               | 1 week  | Understand how models are made              |
| **4** | Prompting, RAG, Fine-tuning          | 2 weeks | **Can customize LLMs for your use case** ⭐ |
| **5** | Tools & frameworks                   | 1 week  | Can actually build things                   |
| **6** | Advanced topics                      | Ongoing | Keep growing                                |

**Total core roadmap: ~7 weeks at 1 hour/day.**

---

# 🎯 Milestones to Check Yourself

You'll know you're making real progress when you can:

- [ ] Explain what a token is to a non-technical friend
- [ ] Draw the flow of text through a Transformer (tokens → embeddings → attention → output)
- [ ] Explain why a base model isn't immediately useful as a chatbot
- [ ] Decide between prompting, RAG, and fine-tuning for a given problem
- [ ] Build a working RAG chatbot over your own documents
- [ ] Fine-tune a small model with LoRA on Google Colab
- [ ] Run an open LLM completely offline on your own machine
- [ ] Read a new LLM paper's abstract and roughly understand what's new

---

# 💡 Key Mindsets

1. **Build things, don't just read.** You'll learn 10x more from a messy working RAG chatbot than from reading 100 articles.
2. **Don't fear the math, but don't get stuck on it either.** You can go very far with intuition alone. Add math later if you need it.
3. **Open models are your friend.** Llama, Qwen, Mistral, Gemma — you can download them, inspect them, fine-tune them. Use this.
4. **RAG before fine-tuning. Always.** 90% of "I need to train a model on my company data" problems are really RAG problems.
5. **Start tiny.** A 0.5B model on your laptop teaches you more than a 70B model on a cloud GPU.

---

# 📺 The Three Resources That Matter Most

If you only have time for three things, do these:

1. **Andrej Karpathy — "Intro to Large Language Models"** (YouTube, 1 hour)
2. **Jay Alammar — "The Illustrated Transformer"** (blog post, free)
3. **Build a RAG chatbot from scratch** using your own documents

Everything else is bonus.

---

_Good luck. The field moves fast, but the fundamentals in this roadmap will stay relevant for years. Come back and update this file as you learn._
