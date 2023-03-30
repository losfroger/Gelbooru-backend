FROM node:16-alpine

WORKDIR /usr/src

COPY ["package.json", "yarn.lock", "/usr/src/"]
RUN yarn install

COPY [".", "/usr/src/"]

EXPOSE 5000

ENTRYPOINT ["/usr/local/bin/yarn", "run"]
CMD ["start"]