# ==========================================
# STAGE 1: Build Image
# ==========================================
FROM node:22-bookworm-slim AS build

WORKDIR /app

# Kích hoạt corepack và pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency manifests để tận dụng Docker layer cache
COPY package.json pnpm-lock.yaml ./

# Cài đặt toàn bộ dependencies phục vụ build
RUN pnpm install --frozen-lockfile

# Copy mã nguồn và các file cấu hình TypeScript
COPY tsconfig*.json ./
COPY src ./src
COPY docs ./docs

# Biên dịch TypeScript sang JavaScript trong thư mục dist/
RUN pnpm build

# ==========================================
# STAGE 2: Runtime Image (Nhẹ và an toàn)
# ==========================================
FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./

# Chỉ cài đặt production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy mã nguồn đã build từ STAGE 1
COPY --from=build /app/dist ./dist

# Copy OpenAPI spec và thư mục public (cho upload avatar)
COPY docs/openapi.yaml ./docs/openapi.yaml
COPY public ./public

# Mở cổng mặc định 5000
EXPOSE 5000

# Khởi chạy ứng dụng
CMD ["node", "dist/server.js"]

