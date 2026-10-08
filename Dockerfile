FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

EXPOSE 8888

CMD ["sh", "-c", "node initDB.js && node server.js"]
