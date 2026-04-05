# FlowPilot AI

FlowPilot AI is a frontend-first SaaS workspace built with Next.js App Router, Tailwind CSS v4, shadcn/ui, and Zustand. The project is intentionally scoped as a portfolio build that shows:

- multi-panel workspace orchestration
- mock AI streaming with retry, cancel, and failure paths
- local persistence for draft values and revision history
- side-by-side revision comparison

## Scripts

```bash
npm run dev
npm run lint
npm run test
npm run test:e2e
```

## Primary Routes

- `/` template gallery and recent local sessions
- `/workspace/[templateId]` main workflow builder

## Notes

- Mock generation is local-only and intentionally backend-free in this version.
- Workspace snapshots are stored in `localStorage`.
- Product requirements for the concept live in [prd.md](./prd.md).
