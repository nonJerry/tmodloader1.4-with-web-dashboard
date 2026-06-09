FROM node:alpine AS build

# Build app
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# Serve
FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/web.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
