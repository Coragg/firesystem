# Project Overview

FireSystem is the SvelteKit frontend for the FireSystem application. It is built with Svelte 5, TypeScript, Vite, Tailwind CSS, and managed with pnpm.

## Tech Stack

- **Language:** TypeScript
- **Framework:** SvelteKit with Svelte 5
- **Package manager:** pnpm
- **Styling:** Tailwind CSS 4 with daisyUI 5 (custom themes)
- **Icons, maps, charts:** Lucide (`@lucide/svelte`), Leaflet, ECharts
- **Testing:** Vitest (Node and browser projects)
- **Build tool:** Vite

## Folder Structure

```text
.
├── src/
│   ├── app.html             # HTML shell for the SvelteKit app
│   ├── app.d.ts             # App-wide TypeScript declarations
│   ├── lib/                 # Shared components, utilities, and assets
│   │   ├── assets/          # Static assets imported by application code
│   │   ├── components/      # UI components: layout/, ui/, charts/, map/, and one folder per screen
│   │   ├── styles/          # Global design tokens: colors.css, spacing.css, typography.css
│   │   ├── data/            # Placeholder data until the backend API exists
│   │   ├── charts/          # ECharts setup (only the modules in use)
│   │   ├── map/             # Map configuration (basemap tile provider)
│   │   ├── sensors.ts       # MODIS / VIIRS definitions and their theme colors
│   │   ├── frp.ts           # Fire radiative power levels and their theme colors
│   │   ├── activity.ts      # Summaries of a daily activity series
│   │   ├── theme.ts         # Reads theme tokens for ECharts and Leaflet
│   │   └── types.ts         # Shared domain types
│   └── routes/              # SvelteKit file-based routes and layouts
│       ├── layout.css       # Tailwind entry point and daisyUI themes
│       └── (app)/           # Signed-in app: shared sidebar layout and its pages
├── static/                  # Public files served from the site root (when needed)
├── package.json             # Scripts and dependency declarations
├── pnpm-lock.yaml           # Locked dependency versions
├── pnpm-workspace.yaml      # pnpm workspace configuration
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite, plugins, and Vitest configuration
```

Keep route-specific pages and layouts in `src/routes/`. Put reusable UI and shared application code in `src/lib/`; use SvelteKit's `src/lib/server/` for code that must remain server-only. Put files that need to be served unchanged from the site root in `static/`. Update this structure description as the project grows.

## Development Commands

Run these from the repository root:

```bash
# Install dependencies from the lockfile
pnpm install --frozen-lockfile

# Start the development server
pnpm dev

# Check Svelte and TypeScript diagnostics
pnpm check

# Run unit and component tests
pnpm test

# Create a production build
pnpm build

# Preview the production build locally
pnpm preview
```

Use `pnpm add <package>` for runtime dependencies and `pnpm add -D <package>` for development dependencies. Keep `package.json` and `pnpm-lock.yaml` in sync.

## Git Rules

### Hard Restrictions

- Never run `git push`.
- Never run `git commit` without the user's explicit confirmation. Before committing, show the proposed message and staged files.
- Do not run destructive commands such as `git reset --hard`, `git clean -fd`, `git checkout .`, branch deletion, or force operations unless explicitly requested.
- Do not rewrite history with `rebase` or `commit --amend` unless explicitly requested.
- Never skip hooks with `--no-verify`.

### Branches

- Treat `main` as the stable branch; do not make task changes directly on it.
- Create a task branch from the repository's designated integration branch when one exists, using `<type>/<short-description>` (for example, `feat/hotspot-map`).
- Do not assume an integration branch exists; check the repository's current branch and available branches first.

### Commit Messages

Use Conventional Commits in English:

```text
<type>: <short summary>
```

- Use one of: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, or `build`.
- Write the summary in imperative mood, lowercase, no more than 72 characters, and without a trailing period.
- Keep each commit to one logical change. Add a body only when the reason is not clear from the summary.
- When asked to commit, offer three meaningfully different message options and wait for the user's choice and explicit confirmation.

### Before Committing

- Review `git status` and the relevant diff before changing or summarizing repository changes.
- Run the project checks and tests required by the task; do not commit if the required checks fail.
- Stage files explicitly by name; do not use `git add -A` or `git add .`.
- Never commit secrets, `.env` files, or real credentials.
- Do not add `Co-Authored-By` lines or other attribution trailers. Do not mention AI tools in commit messages, branch names, or PR descriptions.

## Agent Rules

- Preserve unrelated user changes; inspect the working tree before editing.
- Keep this file aligned with the repository's actual structure, scripts, and workflow as they evolve.
