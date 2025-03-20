FROM node:18-alpine
WORKDIR /backend
COPY package.json yarn.lock ./
RUN yarn install --production
COPY . .
EXPOSE 3000
CMD ["node", "src/server.js"]