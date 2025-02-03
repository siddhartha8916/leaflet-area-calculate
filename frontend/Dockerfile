FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# ============================

FROM nginx:alpine

EXPOSE 3000

COPY --from=base /app/dist /usr/share/nginx/html

