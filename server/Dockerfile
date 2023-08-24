###################
# DEVELOPMENT
###################

FROM node:18.15.0-alpine As development

WORKDIR /usr/src/app/server

RUN npm install -g pnpm

EXPOSE ${SERVER_PORT}

###################
# BUILD FOR PRODUCTION
###################

FROM node:18.15.0-alpine As build

WORKDIR /usr/src/app/server

COPY --chown=node:node server ./
COPY --chown=node:node models ../models

RUN rm -rf /usr/src/app/server/node_modules

RUN npm install -g pnpm

RUN pnpm install
RUN pnpm build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

RUN rm -rf /usr/src/app/server/node_modules
RUN pnpm install -P --lockfile-only

RUN pnpm prune --prod --no-optional

USER node

###################
# PRODUCTION
###################

FROM node:18.15.0-alpine As production

EXPOSE ${SERVER_PORT}

WORKDIR /usr/src/app/server

COPY --chown=node:node --from=build /usr/src/app/server/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/server/dist ./dist
COPY --chown=node:node --from=build /usr/src/app/server/migrations ./migrations
COPY --chown=node:node --from=build /usr/src/app/server/knexfile.js ./knexfile.js

CMD [ "node", "dist/main.js" ]
