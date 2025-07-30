# rep

A **self‑hosted playground for Large Language Model (LLM) experimentation**. The repository bundles a minimal Go‑based backend (`gollm‑mini`), a React/TypeScript front‑end (`gollm‑ui`), helper services for Hugging Face inference (`hf‑api`), and Docker‑based operational tooling.

> **Why "rep"?**  The name comes from *Rapid Experiment Platform* — a place to *rep* ideas quickly, compare models, and capture results.

---

## ✨ Key Features

| Area                          | Highlights                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Multi‑Provider**            | Plug‑and‑play adapters for Ollama (local), Hugging Face endpoints, and OpenAI‑compatible APIs.                      |
| **Prompt & Model Comparison** | Send the same prompt to several models side‑by‑side, then store graded results for later analysis.                  |
| **Session Memory**            | Per‑conversation context with automatic persistence (PostgreSQL).                                                   |
| **Streaming SSE**             | Token‑level streaming responses to the UI for low‑latency chat.                                                     |
| **Scoring & Analytics**       | Built‑in rubric/LLM‑based scoring; results are written to the database for offline evaluation.                      |
| **One‑Command Deployment**    | `docker compose up` spins up backend, UI, database, Ollama and optional observability stack (Prometheus + Grafana). |

---

## 🗂️ Repository Layout

```
rep/
│
├─ gollm-mini/        # Go backend (REST + SSE)
├─ gollm-ui/          # React + Vite front‑end
├─ hf-api/            # Lightweight FastAPI proxy for HuggingFace Inference Endpoints
├─ ops/               # Kubernetes & Grafana dashboards, CI scripts, etc.
│
├─ docker-compose.yml           # Dev stack (Postgres, Ollama, backend, UI)
└─ docker-compose.observ.yml    # Optional observability add‑ons
```

---

## 🚀 Quick Start (Docker)

```bash
# 1. Clone
$ git clone https://github.com/xxxiyxh/rep.git && cd rep

# 2. (Optional) adjust .env files for API keys, ports, etc.

# 3. Launch everything
$ docker compose up -d

# 4. Open the UI
Visit http://localhost:5173  (default Vite dev port)
```

Services started:

| Container                  | Port        | Purpose                                        |
| -------------------------- | ----------- | ---------------------------------------------- |
| `postgres`                 | 5432        | session & scoring storage                      |
| `ollama`                   | 11434       | local LLMs (e.g. llama3)                       |
| `gollm-mini`               | 8080        | REST/SSE API                                   |
| `gollm-ui`                 | 5173        | web client                                     |
| `prometheus` / `grafana`\* | 9090 / 3000 | metrics & dashboards (*observability profile*) |

---

## 🛠️ Local Development

### Backend

```bash
cd gollm-mini
# Requires Go 1.22+
go run ./cmd/server -config config.yaml
```

* Hot‑reload is available via `air` (see `.air.toml`).
* Configuration is read from `config.yaml` **plus** env‑vars — keep secrets out of source.

### Front‑end

```bash
cd gollm-ui
# Requires Node 20+
pnpm install
pnpm dev   # Vite live‑reload
```

UI is auto‑configured to proxy API calls to `gollm-mini`.

---

## 🔌 Supported Providers

| Provider              | Models Tested                | Notes                           |
| --------------------- | ---------------------------- | ------------------------------- |
| **Ollama**            | `llama3:8b`, `mistral:7b`, … | Runs locally inside Docker.     |
| **Hugging Face**      | Any Inference Endpoint       | Forwarded via `hf-api` proxy.   |
| **OpenAI‑Compatible** | GPT‑4o, GPT‑3.5‑turbo        | Supply `OPENAI_API_KEY` in env. |

Adding a new provider only takes \~20 LOC — implement the `Provider` interface inside `gollm-mini/internal/providers`.

---

## 📊 Scoring & Result Persistence

Each prompt/response pair is stored with:

* **raw text**
* **model metadata** (provider, latency, cost if available)
* **scores** — numeric rubric or LLM‑grader output

This enables offline analysis, A/B testing and dashboarding (Grafana dashboards are provided under `ops/grafana/`).

---

## 🏗️ Roadmap

* [ ] **Function calling** / tools API support
* [ ] **Role‑play agent templates**
* [ ] **WebSockets** alternative to SSE
* [ ] **Fine‑tuning helper scripts**
* [ ] **Helm chart** for cluster deployments

Feel free to open an issue or PR if you’d like to help!

---

## 🤝 Contributing

1. Fork the project & create a feature branch.
2. Follow the linting presets (`golangci-lint`, `eslint`, `prettier`).
3. Add tests for new behaviour.
4. Submit a Pull Request.

All contributors must sign the **DCO** (see `.github/CONTRIBUTING.md`).

