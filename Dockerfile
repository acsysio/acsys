FROM node:alpine
WORKDIR /app
COPY ./ /app
RUN npm install --legacy-peer-deps
RUN npm run build-linux
EXPOSE 8080
CMD ["npm", "start"]