---
name: git
description: Use whenever working with Git branches, commits, or history.
---
# Rules: Git

## Hard Restrictions
- Never run `git push`.
- Never run `git commit` without the user's explicit confirmation. Before committing, show the proposed message and staged files.
- Do not run destructive commands such as `git reset --hard`, `git clean -fd`, `git checkout .`, branch deletion, or force operations unless explicitly requested.
- Do not rewrite history with `rebase` or `commit --amend` unless explicitly requested.
- Never skip hooks with `--no-verify`.

## Branches
- Treat `main` as the stable branch; do not make task changes directly on it.
- Create task branches from the designated integration branch when one exists, using `<type>/<short-description>` (for example, `feat/hotspot-map`).
- Check available branches first; do not assume an integration branch exists.

## Commit Messages
Use Conventional Commits in English:

```text
<type>: <short summary>
```

- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, or `build`.
- Write the summary in imperative mood, lowercase, no more than 72 characters, without a trailing period.
- Keep one logical change per commit. Add a body only when the reason is not clear from the summary.
- When asked to commit, offer three meaningfully different message options and wait for the user's choice and explicit confirmation.

## Attribution
- Do not add `Co-Authored-By` lines or other attribution trailers.
- Do not mention models or AI tools in commit messages, PR descriptions, or branch names.

## Before Committing
- Review `git status` and the relevant diff.
- Run the checks and tests required by the task; do not commit if required checks fail. For this project, use the relevant `pnpm` scripts in `package.json` (such as `pnpm check`, `pnpm test`, and `pnpm build`).
- Stage files explicitly by name; do not use `git add -A` or `git add .`.
- Never commit secrets, `.env` files, or real credentials.

## Style
- Do not invent changes the diff does not contain.
- Do not repeat in the body what the summary already says.
