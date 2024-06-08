FROM node:20-alpine

EXPOSE 3000

ADD . /app
WORKDIR /app

RUN npm ci
RUN npm run build

CMD npm start
