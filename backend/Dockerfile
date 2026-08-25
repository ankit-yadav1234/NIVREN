# Minimal container for running the NIVREN voice-agent worker on LiveKit Cloud.
# This backend folder also contains the Express API (src/index.ts) — that is
# NOT deployed here, only the voice-agent (src/voice-agent/agent.ts). The
# Express API keeps running wherever it's separately hosted.
# syntax=docker/dockerfile:1

ARG NODE_VERSION=22
FROM node:${NODE_VERSION}-slim AS base

RUN apt-get update -qq && apt-get install --no-install-recommends -y ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy just the dependency files first, for more efficient layer caching
COPY package.json package-lock.json ./
RUN npm ci

# Copy all remaining application files into the container
# (Excludes files specified in .dockerignore)
COPY . .

# Build the project (tsc -> dist/)
RUN npm run build

# Create a non-privileged user that the app will run under
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/app" \
    --shell "/sbin/nologin" \
    --uid "${UID}" \
    appuser

RUN chown -R appuser:appuser /app
USER appuser

# No local models to pre-download — Gemini Realtime is a remote API call,
# not a local model, so there's nothing for a download-files step to fetch.

# Switch back to root to remove dev dependencies and finalize setup
USER root
RUN npm prune --production && chown -R appuser:appuser /app
USER appuser

ENV NODE_ENV=production

# Run the voice-agent worker specifically (not the Express API's own "start"
# script, which is a different process — see the note at the top of this file).
CMD [ "node", "dist/voice-agent/agent.js", "start" ]
