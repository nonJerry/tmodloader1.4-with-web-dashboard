FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable
RUN pnpm --version

FROM base AS dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY control/backend ./control/backend
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm ci --include=optional

FROM dependencies AS build-dev
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter @terraria-podman/control-backend deploy /app


FROM dependencies AS build-prod
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter @terraria-podman/control-backend build && \
  pnpm --filter @terraria-podman/control-backend deploy --prod /app && \
  mv /app/dist/src/ /app/src/ && rm -rf /app/dist

FROM base AS development
WORKDIR /app
ARG NODE_ENV=development
ENV NODE_ENV=$NODE_ENV
ARG PORT=80
ENV PORT=$PORT
COPY --from=build-dev /app /app
ENTRYPOINT ["pnpx", "tsx", "watch", "src/index.ts"]
EXPOSE $PORT 9229 9230


FROM node:lts-alpine AS production
ARG NODE_ENV=production
WORKDIR /app
COPY --from=build-prod /app /app
ENTRYPOINT [ "node", "src/index.js" ]
EXPOSE 8000