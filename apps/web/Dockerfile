# FormatFlow Web Frontend Dockerfile
FROM node:22-bullseye-slim AS builder

WORKDIR /app

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/web/package*.json ./apps/web/

RUN npm ci

COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

RUN npm --prefix packages/shared run build
RUN npm --prefix apps/web run build

# Nginx Alpine runtime
FROM nginx:alpine AS runner

COPY --from=builder /app/apps/web/dist/web/browser /usr/share/nginx/html

# Custom nginx config for Angular routing and gzip
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    location /api/ { \
        proxy_pass http://api:3000; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
        client_max_body_size 100M; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
