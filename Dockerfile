FROM node:18.7.0-alpine3.16
WORKDIR /app
COPY ./ /app
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]