#!/bin/bash

cp .env.example .env 2>/dev/null || true

docker compose up -d
npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
