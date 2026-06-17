FROM node:slim AS dependencies
WORKDIR /code
COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json
COPY control/backend/package.json /code/control/backend/package.json
RUN npm ci --workspace @terraria-podman/control-backend

FROM dependencies AS build
COPY control/backend /code/control/backend
RUN npm run build --workspace @terraria-podman/control-backend

FROM dependencies AS development
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV
ARG PORT=80
ENV PORT $PORT
WORKDIR /code/control/backend
COPY control/backend /code/control/backend
CMD ["npx", "tsx", "watch", "src/index.ts"]
EXPOSE $PORT 9229 9230


FROM dependencies AS production
ARG NODE_ENV=production
RUN npm prune --omit=dev
WORKDIR /code/control/backend/
COPY --from=build /code/control/backend/dist /code/control/backend/
CMD [ "node", "src/index.js" ]
EXPOSE 8000