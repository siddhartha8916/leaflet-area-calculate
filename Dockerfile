FROM node:lts-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

# ============================

FROM nginx:alpine

EXPOSE 80

COPY --from=base /app/dist /usr/share/nginx/html
COPY nginx-conf/nginx.conf /etc/nginx/nginx.conf

# Start NGINX in the foreground
CMD ["nginx", "-g", "daemon off;"]

