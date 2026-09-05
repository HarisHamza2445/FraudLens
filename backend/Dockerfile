FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

# Persistent audit data volume (optional override of in-repo history.json)
ENV PORT=5005
EXPOSE 5005

CMD ["node", "server.js"]
