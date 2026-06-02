#!/bin/bash

cat > .env <<'EOF'
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="dev-secret-change-me"
NEXTAUTH_URL="http://localhost:3000"
EOF

npm install
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
