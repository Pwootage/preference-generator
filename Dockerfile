## build runner
FROM node:lts-alpine as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package.json .

# Install dependencies
RUN npm install

# Move source files
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json   .

# Build project
RUN npm run db:generate && npm run build

## producation runner
FROM node:lts-alpine as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json
COPY --from=build-runner /tmp/app/build /app/build
COPY --from=build-runner /tmp/app/prisma /app/prisma

# Install dependencies
RUN npm install --only=production

RUN npm run db:generate

# Start bot
CMD [ "npm", "run", "start:prod" ]
