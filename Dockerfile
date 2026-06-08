FROM node:20-alpine AS base

WORKDIR /app

# ffmpeg — конвертация MOV → MP4 при сборке (опционально)
RUN apk add --no-cache ffmpeg wget

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Обновить media.json из папки VaP
RUN node build-vap.js

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

USER node

CMD ["node", "server.js"]
