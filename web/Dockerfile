FROM node:20-alpine AS dependencies

WORKDIR /app

COPY package*.json ./
RUN npm ci

# ---- builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- production ----
FROM node:20-alpine

RUN apk add --no-cache tini

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "start"]
