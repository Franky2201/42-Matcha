FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json .npmrc ./

FROM base AS development
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]

FROM base AS builder
RUN apk add --no-cache openssl
COPY . .
RUN npm ci
ARG DOMAIN_NAME
RUN if [ -z "$DOMAIN_NAME" ]; then echo "DOMAIN_NAME build arg is required"; exit 1; fi
RUN chmod +x ./nginx/tls_setup.sh && ./nginx/tls_setup.sh
RUN npm run build

FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /etc/nginx/tls /etc/nginx/tls
COPY nginx/nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
