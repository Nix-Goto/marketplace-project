# Используем официальный Python-образ
FROM python:3.9-slim

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /usr/src/app

# Копируем файл с зависимостями и устанавливаем их
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Копируем оставшуюся часть проекта
COPY . .

# Указываем команду для запуска приложения
CMD ["python", "main.py"]
