FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 拷贝脚本
COPY api.py .

EXPOSE 8000
# 在 api.py 里肯定有 `app = FastAPI()` 之类
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1"]
