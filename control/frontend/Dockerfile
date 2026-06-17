FROM node:lts-alpine AS dependencies
WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY control/frontend/package.json /app/control/frontend/package.json
RUN npm ci --workspace @terraria-podman/control-frontend --include=optional


FROM dependencies AS build
COPY control/frontend /app/control/frontend
RUN npm run build --workspace @terraria-podman/control-frontend

# Requires code mounted to /app/control/frontend if you want live updates
FROM dependencies AS development
WORKDIR /app/control/frontend
COPY control/frontend /app/control/frontend
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM nginx:stable-alpine AS production
RUN rm /etc/nginx/conf.d/default.conf
COPY --from=build /app/control/frontend/nginx.conf /etc/nginx/conf.d/web.conf
COPY --from=build /app/control/frontend/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 8080
