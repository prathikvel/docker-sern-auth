FROM node:lts as base
WORKDIR /home/node

FROM base as dev
ENV NODE_ENV=development
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
USER node
COPY . .
CMD npm run dev
HEALTHCHECK --interval=1m --timeout=10s --start-period=30s --start-interval=5s \
    CMD npx ts-node --transpileOnly -r tsconfig-paths/register src/healthcheck.ts

FROM base as test
ENV NODE_ENV=test
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
USER node
COPY . .
CMD npm run test

FROM base as prod
ENV NODE_ENV=production
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
USER node
COPY . .
CMD npm run start
HEALTHCHECK --interval=1m --timeout=10s --start-period=30s --start-interval=5s \
    CMD node -r tsconfig-paths/register src/healthcheck.js
