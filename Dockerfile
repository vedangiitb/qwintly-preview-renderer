FROM node:20-slim

WORKDIR /app

# Build-time defaults. Override via `--build-arg ...` (Cloud Build in CI).
ARG NEXT_PUBLIC_PARENT_ORIGIN
ARG LOCAL_PARENT_ORIGIN

# Runtime env (also visible during `npm run build` in this Dockerfile).
ENV NEXT_PUBLIC_PARENT_ORIGIN=$NEXT_PUBLIC_PARENT_ORIGIN
ENV LOCAL_PARENT_ORIGIN=$LOCAL_PARENT_ORIGIN

# install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# copy source
COPY . .

# build TypeScript
RUN npm run build

# remove dev dependencies
RUN npm prune --omit=dev

EXPOSE 8080

CMD ["npm", "run", "start"]
