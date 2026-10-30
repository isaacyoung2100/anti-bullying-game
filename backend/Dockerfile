FROM python:3.12-slim

# Hugging Face Spaces 用 uid 1000 執行
RUN useradd -m -u 1000 user
USER user
WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt
COPY --chown=user app.py .

ENV PATH="/home/user/.local/bin:$PATH"
EXPOSE 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
