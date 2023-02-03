FROM node:18-alpine AS build

LABEL maintainer="Satit Rianpit <rianpit@gmail.com>"

WORKDIR /app

RUN apk update && \
  apk upgrade && \
  apk add --no-cache \
  python3 \
  g++ gcc \
  make

COPY . .

RUN npm i && npm rebuild bcrypt && npm run build

RUN rm -rf src node_modules && npm i --omit=dev

RUN npm rebuild bcrypt

RUN npm i -g pm2 

EXPOSE 3000

CMD ["pm2-runtime", "--json", "/app/process.json"]
