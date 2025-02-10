FROM node:18-alpine

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости и vite глобально
RUN npm install && \
    npm install -g vite

# Копируем исходный код
COPY . .

# Даем права на выполнение для node_modules
RUN chmod -R 755 node_modules/

# Открываем порт
EXPOSE 8080

# Запускаем приложение
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"] 