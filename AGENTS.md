# Flash — Ruflo Agent Coordination

## Swarm Topology: Hierarchical
Queen agent coordinates; specialized workers execute in parallel where safe.

## Agent Roster for Flash

### Tier 1 — Always Active
| Agent | Role | When |
|-------|------|------|
| flash-architect | Reviews all decisions for Next.js 14 + Supabase compatibility | Every task |
| flash-reviewer | Checks output matches luxury-minimal design system | Every UI task |

### Tier 2 — Spawned on Demand
| Agent | Type | Spawn When |
|-------|------|-----------|
| frontend-coder | coder | Any React/Tailwind component work |
| supabase-specialist | database | Schema, RLS policies, realtime subscriptions |
| canvas-specialist | coder | Photo modes, image processing, canvas effects |
| i18n-specialist | coder | Translation strings, RTL layout, language switching |
| security-specialist | reviewer | Auth flows, file upload, storage policies |
| perf-analyst | reviewer | Core Web Vitals, bundle size, image optimization |
| test-engineer | tester | Component tests, E2E with Playwright |

## Spawn Commands (Claude Code)
```bash
# Start Flash swarm session
npx ruflo swarm start --topology hierarchical --project flash --max-agents 6

# Spawn specific agent
npx ruflo agent spawn --type coder --name frontend-coder --context .claude/skills/flash-context.md

# Run task with auto-routing
npx ruflo task run "Add new photo mode: VHS tape effect with scan lines"
```

## Background Workers (Auto-Triggered)
- **On file save:** lint + type-check
- **On commit:** security-audit, test gaps check
- **Weekly:** bundle size report, unused dependency scan
- **Before deploy:** performance baseline check

## Memory Operations
```bash
# Store design decision
npx ruflo memory store --namespace flash:design --key "photo-mode-pattern" \
  --value "Each mode: name, CSS filter string, canvas transform, preview thumbnail"

# Search past decisions
npx ruflo memory search "how did we implement the scavenger hunt feature"

# Save session snapshot before big changes
npx ruflo rvf save --name "before-reveal-mode-refactor"
```

## Federation (Future)
If Behnam adds collaborators, federation allows cross-machine agent collaboration
with PII stripping and zero-trust identity verification.
```bash
npx ruflo federation init
npx ruflo federation join wss://collaborator.example.com:8443
```

## Cost Control
- Session budget: $5.00 USD
- Headroom compression on all tool outputs (target 70%+ reduction)
- Alert at 80% budget consumed
- Use Haiku 4.5 for: linting, type checks, simple queries
- Use Sonnet 4.6 for: implementation, architecture, complex tasks
