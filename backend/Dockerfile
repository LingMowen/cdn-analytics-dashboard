FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY src ./src
COPY data ./data
COPY .env.example ./.env

EXPOSE 4000

ENV NODE_ENV=production
ENV PORT=4000

CMD ["node", "src/index.js"]
