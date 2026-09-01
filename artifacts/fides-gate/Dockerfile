FROM node:22 AS build
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json tsconfig.json ./
COPY artifacts/fides-gate/package.json artifacts/fides-gate/package.json
COPY lib/api-client-react/package.json lib/api-client-react/package.json
COPY lib/api-spec/package.json lib/api-spec/package.json
COPY lib/api-zod/package.json lib/api-zod/package.json
RUN pnpm install --frozen-lockfile
COPY . .
ENV PORT=23502
ENV BASE_PATH=/
RUN pnpm --filter @workspace/fides-gate run build

FROM node:22
WORKDIR /app
COPY --from=build /app/artifacts/fides-gate/dist/public ./dist/public
RUN npm install -g serve
EXPOSE 10000
CMD ["sh", "-c", "serve -s dist/public -l ${PORT:-10000}"]