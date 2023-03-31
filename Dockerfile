FROM node:16-alpine as Build
WORKDIR /usr
COPY ["package.json", "yarn.lock", "tsconfig.json", "./"]

COPY ["./src", "/usr/src"]

RUN yarn install
RUN yarn run build

FROM node:16-alpine as Run

WORKDIR /usr

RUN yarn global add pm2

COPY ["package.json", "yarn.lock", "./"]
RUN yarn install --prod

COPY --from=Build ["/usr/dist", "."]

EXPOSE 5000

ENTRYPOINT ["pm2-runtime", "index.js"]