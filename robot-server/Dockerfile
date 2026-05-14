FROM node:20-alpine

# Install Python and build tools for native modules (e.g., usb)
RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./

RUN npm install --production

# Remove build tools to reduce image size
RUN apk del python3 make g++

COPY . .

RUN chmod +x docker-entrypoint.sh

EXPOSE 3002

CMD ["./docker-entrypoint.sh"]
