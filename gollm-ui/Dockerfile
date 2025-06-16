########################  Build stage  ########################
FROM node:22-alpine AS builder
WORKDIR /ui

COPY package*.json ./
RUN npm ci          # 利用 package-lock 加速

COPY . .
RUN npm run build   # 输出 dist/

########################  Runtime stage  ######################
FROM nginx:stable-alpine
COPY --from=builder /ui/dist /usr/share/nginx/html

# 反代 /api -> backend
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK CMD wget -qO- http://localhost/ || exit 1
