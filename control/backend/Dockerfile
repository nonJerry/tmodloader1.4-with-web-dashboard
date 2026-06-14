FROM node:slim AS dependencies
WORKDIR /code
COPY package.json /code/package.json
COPY package-lock.json /code/package-lock.json
COPY .yarnrc.yml .
RUN npm ci


FROM dependencies AS build
COPY . /code
RUN npm run build


FROM dependencies AS development
ARG NODE_ENV=development
ENV NODE_ENV $NODE_ENV
ARG PORT=80
ENV PORT $PORT
COPY . /code
CMD ["npx", "tsx", "watch", "src/index.ts"]
EXPOSE $PORT 9229 9230


FROM dependencies AS production
ARG NODE_ENV=production
RUN npm prune --omit=dev
COPY --from=build /code/dist /code
CMD [ "node", "index.js" ]
EXPOSE 8000
