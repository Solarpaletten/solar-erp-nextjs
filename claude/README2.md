# Solar ERP - Deployment Structure

## Project Structure

```
solar-erp-deployment/
├── claude/
│   └── overview/          # Architecture & connector docs
├── backend/               # API, Prisma, business logic
│   └── itsolar/          # ITSolar product backend
│       ├── api/          # API routes
│       ├── prisma/       # Database schema & migrations
│       └── lib/          # Utilities & helpers
└── frontend/             # Next.js, React, UI
    └── itsolar/          # ITSolar product frontend
        ├── components/   # React components
        ├── pages/        # Next.js pages
        └── styles/       # Tailwind CSS
```

## Documentation
- [ARCHITECTURE.md](./claude/overview/ARCHITECTURE.md) - System architecture
- [SOLAR_CONNECTOR.md](./claude/overview/SOLAR_CONNECTOR.md) - GitHub integration
- [DEPLOYMENT_REPORT.md](./claude/overview/DEPLOYMENT_REPORT.md) - Deployment status

## Team
- **Леонид** - Архитектор
- **Dashka** - Senior Lead
- **Claude** - AI Engineer

🚀 Космический корабль Solar ERP
