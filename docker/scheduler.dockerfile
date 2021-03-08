FROM node:14.16.0-alpine3.10
WORKDIR /app

COPY ./package.json /app
COPY ./package-lock.json /app
COPY ./config /app/config
COPY ./scheduler /app/scheduler
COPY ./internal /app/internal
COPY ./scripts /app/scripts

RUN apk add --no-cache bash
RUN npm ci --silent

CMD [ "npm", "run", "scheduler" ]
