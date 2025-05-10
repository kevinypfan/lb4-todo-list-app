# Check out https://hub.docker.com/_/node to select a new base image
FROM docker.io/library/node:22-slim

# 設定環境變數 - 這些是默認值，可在運行容器時被覆蓋
ENV HOST=0.0.0.0 \
    PORT=3000 \
    DB_HOST=localhost \
    DB_PORT=3306 \
    DB_USER=root \
    DB_PASSWORD=example \
    DB_DATABASE=todo_app \
    DB_URL=mysql://root:example@localhost:3306/todo_app

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package*.json ./

RUN npm install

# Bundle app source code
COPY --chown=node . .

RUN npm run build

# Bind to all network interfaces so that it can be mapped to the host OS
EXPOSE ${PORT}
CMD [ "node", "." ]
