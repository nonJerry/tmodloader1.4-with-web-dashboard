FROM node:lts-alpine AS dependencies
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY control/frontend/ /app/control/frontend/
RUN npm i -g pnpm && pnpm --filter @terraria-podman/control-frontend ci --include=optional


FROM dependencies AS build
RUN pnpm --filter @terraria-podman/control-frontend build

# Requires code mounted to /app/control/frontend if you want live updates
FROM dependencies AS development
WORKDIR /app/control/frontend
CMD ["pnpm", "dev", "--host", "0.0.0.0"]


FROM nginx:stable-alpine AS production
RUN rm /etc/nginx/conf.d/default.conf
COPY control/frontend/nginx.conf /etc/nginx/conf.d/web.conf
COPY --from=build /app/control/frontend/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 8080
