FROM python:3.9-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y gcc libpq-dev && rm -rf /var/lib/apt/lists/*

# Установка Poetry
RUN pip install poetry

WORKDIR /usr/src/app

# Сначала копируем файлы, отвечающие за зависимости
COPY pyproject.toml poetry.lock* ./

# Затем копируем исходный код проекта (убедитесь, что папка с вашим проектом присутствует)
# Предположим, что ваш пакет находится в директории 'marketplace_project'
COPY marketplace_project/ ./marketplace_project/

# Теперь устанавливаем зависимости и сам проект
RUN poetry config virtualenvs.create false && poetry install --no-interaction --no-ansi

# Копируем оставшиеся файлы (если необходимо)
# COPY . .

CMD ["python", "app.py"]
