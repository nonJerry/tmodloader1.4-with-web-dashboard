FROM node:lts-alpine AS dependencies
ENV CI=true
WORKDIR /code
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY control/backend/package.json ./control/backend/package.json
RUN npm i -g pnpm && pnpm --filter @terraria-podman/control-backend ci

FROM dependencies AS build
COPY control/backend/tsconfig.json /code/control/backend/tsconfig.json
COPY control/backend/src /code/control/backend/src
RUN pnpm --filter @terraria-podman/control-backend build
RUN pnpm --filter @terraria-podman/control-backend --prod deploy /app
RUN rm -rf /app/src/ && mv /app/dist/src/ /app/src/ && rm -rf /app/dist

FROM dependencies AS development
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV
ARG PORT=80
ENV PORT $PORT
WORKDIR /code/control/backend
COPY control/backend/src /code/control/backend/src
ENTRYPOINT ["pnx", "tsx", "watch", "src/index.ts"]
EXPOSE $PORT 9229 9230


FROM node:lts-alpine AS production
ARG NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
ENTRYPOINT [ "node", "src/index.js" ]
EXPOSE 8000