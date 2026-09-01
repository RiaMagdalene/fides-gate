FROM node:22-alpine AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts/api-server/package.json artifacts/api-server/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
COPY lib/db/package.json lib/db/package.json
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm --filter @workspace/api-server run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/artifacts/api-server/dist ./dist
EXPOSE 5000
ENV NODE_ENV=production
CMD ["node", "dist/index.mjs"]