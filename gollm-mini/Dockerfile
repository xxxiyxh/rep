########################  Build stage  ########################
FROM golang:1.24.3-alpine AS builder
WORKDIR /app

# 加速 go mod，或用你自己的私有代理
ENV GOPROXY=https://proxy.golang.com.cn,direct

COPY go.* ./
RUN go mod download

COPY . .
RUN go build -o gollm ./cmd/gollm-mini

########################  Runtime stage  ######################
FROM alpine:3.20
WORKDIR /app

COPY --from=builder /app/gollm .

# gollm-mini/Dockerfile runtime 段
ENV OLLAMA_HOST=http://ollama:11434
ENV HF_API_HOST=http://hf-api:8000     


EXPOSE 8888
HEALTHCHECK CMD wget -qO- http://localhost:8888/health || exit 1
CMD ["./gollm", "-mode", "server", "-port", "8888"]
