# syntax=docker/dockerfile:1

FROM node:alpine

WORKDIR /app
ENV PORT 8080

EXPOSE 8080

COPY ["package.json", "package-lock.json*", "./"]
RUN npm ci

COPY . .

CMD [ "npm", "run", "pm2" ]