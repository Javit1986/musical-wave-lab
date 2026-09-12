# ---- Build stage ---------------------------------------------------------
# Compiles the Vite/React app to static files (dist/). Runs `npm ci` (not
# `npm install`) so the build uses exactly what's in package-lock.json.
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Serve stage -----------------------------------------------------------
# The app is 100% static (no backend, per the project brief), so the final
# image is just nginx serving the built files — small, and nothing but a
# web server runs at container runtime.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
