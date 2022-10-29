FROM node:lts-alpine

# Set temp directory
WORKDIR /app

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

# Start bot
CMD [ "npm", "run", "start:prod" ]
