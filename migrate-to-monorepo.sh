#!/bin/bash

# Solar ERP - Migrate to Monorepo Structure
# This script converts single package.json to backend + frontend split

set -e

echo "🚀 Solar ERP - Monorepo Migration Script"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found. Run this script from project root.${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 1: Creating backup...${NC}"
cp package.json package.json.backup
cp pnpm-lock.yaml pnpm-lock.yaml.backup 2>/dev/null || true
echo -e "${GREEN}✅ Backup created: package.json.backup${NC}"
echo ""

echo -e "${YELLOW}📋 Step 2: Creating pnpm-workspace.yaml...${NC}"
cat > pnpm-workspace.yaml << 'EOF'
packages:
  - 'backend'
  - 'frontend'
EOF
echo -e "${GREEN}✅ pnpm-workspace.yaml created${NC}"
echo ""

echo -e "${YELLOW}📋 Step 3: Creating root package.json...${NC}"
cat > package.json << 'EOF'
{
  "name": "solar-erp-nextjs",
  "version": "1.0.0",
  "private": true,
  "description": "Solar ERP - AI | IT | Solar Integration Platform",
  "author": "Solar Team (Леонид, Dashka, Claude)",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/Solarpaletten/solar-erp-nextjs.git"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  },
  "scripts": {
    "dev": "pnpm --parallel --stream run dev",
    "dev:backend": "pnpm --filter @solar-erp/backend dev",
    "dev:frontend": "pnpm --filter @solar-erp/frontend dev",
    "build": "pnpm --recursive --stream run build",
    "build:backend": "pnpm --filter @solar-erp/backend build",
    "build:frontend": "pnpm --filter @solar-erp/frontend build",
    "start": "pnpm --parallel --stream run start",
    "start:backend": "pnpm --filter @solar-erp/backend start",
    "start:frontend": "pnpm --filter @solar-erp/frontend start",
    "lint": "pnpm --recursive run lint",
    "clean": "pnpm --recursive run clean && rm -rf node_modules",
    "prisma:generate": "pnpm --filter @solar-erp/backend prisma:generate",
    "prisma:migrate": "pnpm --filter @solar-erp/backend prisma:migrate",
    "prisma:studio": "pnpm --filter @solar-erp/backend prisma:studio",
    "prisma:seed": "pnpm --filter @solar-erp/backend prisma:seed",
    "prisma:reset": "pnpm --filter @solar-erp/backend prisma:reset",
    "test": "pnpm --recursive run test"
  },
  "workspaces": [
    "backend",
    "frontend"
  ],
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.9.2"
  }
}
EOF
echo -e "${GREEN}✅ Root package.json created${NC}"
echo ""

echo -e "${YELLOW}📋 Step 4: Creating backend/package.json...${NC}"
mkdir -p backend
cat > backend/package.json << 'EOF'
{
  "name": "@solar-erp/backend",
  "version": "1.0.0",
  "private": true,
  "description": "Solar ERP Backend API - Prisma + TypeScript",
  "main": "dist/index.js",
  "type": "commonjs",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "lint": "eslint src --ext .ts",
    "clean": "rm -rf dist node_modules",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:migrate:deploy": "prisma migrate deploy",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts",
    "prisma:reset": "prisma migrate reset --force",
    "db:push": "prisma db push",
    "db:pull": "prisma db pull"
  },
  "dependencies": {
    "@prisma/client": "^6.18.0",
    "bcryptjs": "^3.0.2",
    "dotenv": "^17.2.2",
    "jose": "^6.1.0",
    "jsonwebtoken": "^9.0.2",
    "winston": "^3.17.0",
    "zod": "^4.1.8"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/node": "^20.0.0",
    "eslint": "^9",
    "prisma": "^6.18.0",
    "tsx": "^4.7.0",
    "typescript": "^5.9.2"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
EOF
echo -e "${GREEN}✅ backend/package.json created${NC}"
echo ""

echo -e "${YELLOW}📋 Step 5: Creating frontend/package.json...${NC}"
mkdir -p frontend
cat > frontend/package.json << 'EOF'
{
  "name": "@solar-erp/frontend",
  "version": "1.0.0",
  "private": true,
  "description": "Solar ERP Frontend - Next.js + React",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rm -rf .next node_modules"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-toast": "^1.2.15",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^0.544.0",
    "next": "15.5.3",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-hook-form": "^7.62.0",
    "tailwind-merge": "^3.3.1",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^4.1.8"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@tailwindcss/typography": "^0.5.10",
    "@types/node": "^20.0.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.16",
    "eslint": "^9",
    "eslint-config-next": "15.5.3",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.9.2"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
EOF
echo -e "${GREEN}✅ frontend/package.json created${NC}"
echo ""

echo -e "${YELLOW}📋 Step 6: Cleaning old node_modules...${NC}"
rm -rf node_modules
rm -rf backend/node_modules 2>/dev/null || true
rm -rf frontend/node_modules 2>/dev/null || true
rm -rf pnpm-lock.yaml
echo -e "${GREEN}✅ Cleaned${NC}"
echo ""

echo -e "${YELLOW}📋 Step 7: Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

echo -e "${YELLOW}📋 Step 8: Generating Prisma Client...${NC}"
pnpm prisma:generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

echo ""
echo -e "${GREEN}🎉 Migration Complete!${NC}"
echo ""
echo "📊 Summary:"
echo "  ✅ Workspace structure created"
echo "  ✅ Backend package configured"
echo "  ✅ Frontend package configured"
echo "  ✅ Dependencies installed"
echo "  ✅ Prisma Client generated"
echo ""
echo "🚀 Next steps:"
echo "  1. Test backend:  pnpm dev:backend"
echo "  2. Test frontend: pnpm dev:frontend"
echo "  3. Run both:      pnpm dev"
echo ""
echo "📝 Backup saved: package.json.backup"
echo ""