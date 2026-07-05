FROM node:20-slim AS build
WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
ARG VITE_FLOWER_URL=/flower/
ENV VITE_FLOWER_URL=$VITE_FLOWER_URL
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
