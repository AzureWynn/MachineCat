FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ARG REACT_APP_API_BASE=http://localhost:3002/api
ARG REACT_APP_WS_BASE=ws://localhost:3002
ARG REACT_APP_SOLANA_RPC_URL=https://api.devnet.solana.com

ENV REACT_APP_API_BASE=$REACT_APP_API_BASE
ENV REACT_APP_WS_BASE=$REACT_APP_WS_BASE
ENV REACT_APP_SOLANA_RPC_URL=$REACT_APP_SOLANA_RPC_URL

RUN npm run build

FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
