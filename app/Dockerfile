FROM node:lts as base
WORKDIR /home/node

FROM base as dev
ENV NODE_ENV=development
RUN mkdir node_modules && chown node:node node_modules
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
USER node
COPY . .
CMD npm run start

FROM base as test
ENV NODE_ENV=test
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
USER node
COPY . .
CMD npm run test

FROM base as builder
ENV NODE_ENV=production
RUN mkdir node_modules && chown node:node node_modules
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
USER node
COPY . .
RUN npm run build

FROM nginx as prod
COPY ./proxy/default.conf.template /etc/nginx/templates/
COPY --from=builder /home/node/build /usr/share/nginx/html
