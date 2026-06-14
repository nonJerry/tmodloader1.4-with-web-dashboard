FROM node:lts-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci


FROM dependencies AS build
COPY . .
RUN npm run build


# Requires code mounted to /app if you want live updates
FROM dependencies AS development
COPY . .
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


FROM nginx:stable-alpine AS production
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/web.conf
COPY --from=build /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
EXPOSE 8080
