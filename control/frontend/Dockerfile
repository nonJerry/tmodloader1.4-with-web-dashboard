FROM node:lts-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME/bin:$PATH"
RUN corepack enable
RUN pnpm --version


FROM base AS dependencies
WORKDIR /usr/src/app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY control/frontend ./control/frontend
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm ci --include=optional


FROM dependencies AS build
RUN pnpm --filter @terraria-podman/control-frontend build && \
    pnpm --filter @terraria-podman/control-frontend deploy --prod /app


FROM nginx:stable-alpine AS production
RUN rm /etc/nginx/conf.d/default.conf
COPY control/frontend/nginx.conf /etc/nginx/conf.d/web.conf
COPY --from=build /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 8080
