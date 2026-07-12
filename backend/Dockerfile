FROM node:18-bullseye-slim
RUN apt-get update && apt-get install -y python3 build-essential
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p uploads
EXPOSE 10000
CMD ["node", "server.js"]