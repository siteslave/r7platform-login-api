FROM node:18-alpine AS build

LABEL maintainer="Satit Rianpit <rianpit@gmail.com>"

WORKDIR /app

RUN apk update && \
  apk upgrade && \
  apk add --no-cache \
  python3 \
  tzdata \
  build-base \
  libtool \
  autoconf \
  automake \
  g++ gcc \
  make && \
  cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
  echo "Asia/Bangkok" > /etc/timezone

RUN wget -qO /bin/pnpm "https://github.com/pnpm/pnpm/releases/latest/download/pnpm-linuxstatic-x64" && chmod +x /bin/pnpm

COPY . .

RUN pnpm i && pnpm run build

RUN apk del make gcc g++ python3

RUN rm -rf node_modules/gulp && \
    rm -rf node_modules/gulp-clean && \
    rm -rf node_modules/gulp-cli && \
    rm -rf node_modules/gulp-typescript && \
    rm -rf node_modules/gulp-uglify && \
    rm -rf node_modules/nodemon

FROM keymetrics/pm2:18-slim

ENV NODE_ENV === 'production'

COPY --from=build /app /app

EXPOSE 3000

CMD ["pm2-runtime", "--json", "/app/process.json"]
