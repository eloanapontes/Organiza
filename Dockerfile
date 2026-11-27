FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY client/package*.json client/
COPY server/package*.json server/
RUN npm install
COPY client client
COPY server server
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/client/package*.json client/
COPY --from=build /app/server/package*.json server/
RUN npm install --omit=dev
COPY --from=build /app/client/dist client/dist
COPY --from=build /app/server server
EXPOSE 3000
CMD ["npm", "run", "start", "--workspace", "server"]
