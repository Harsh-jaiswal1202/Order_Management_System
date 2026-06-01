# Build stage
FROM node:18-alpine as build-stage
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
# We use the default API URL which will resolve to localhost:8000 on the host machine
RUN npm run build

# Production stage
FROM nginx:stable-alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
