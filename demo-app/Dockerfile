FROM python:3.11-slim

WORKDIR /app

RUN useradd -u 10001 -m sealshipuser

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

USER 10001

EXPOSE 8080

CMD ["python", "app.py"]
