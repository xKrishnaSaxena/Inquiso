FROM node:23.1.0

WORKDIR /app

COPY package*.json ./

RUN corepack enable pnpm

RUN pnpm install

COPY . .

RUN pnpm run build

EXPOSE 3000

CMD ["pnpm","start"]