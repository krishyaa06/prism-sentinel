# Contributing to prism-sentinel

Thanks for taking the time to contribute! prism-sentinel is a Discord bot by [Prism Protocol](https://github.com/krishyaa06) — Prism Sentinel: an all-in-one community, moderation and leveling Discord bot.

## Getting started

```bash
git clone https://github.com/krishyaa06/prism-sentinel.git
cd prism-sentinel
npm install
cp .env.example .env   # fill in your own values — never commit .env
npm start
```

## Before you open a pull request

Make sure everything passes locally:

```bash
npm test
npm run check
```

## Guidelines

- **Never commit tokens.** Keep `DISCORD_TOKEN` and other secrets in `.env` (git-ignored).
- Register new slash commands in the commands folder and re-deploy them before testing.
- Keep pull requests small and focused — one feature or fix per PR.
- Update the README when you change behaviour, flags or options.

## Commit messages

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add --json output
fix: handle empty input
docs: clarify install steps
```

Common types: `feat`, `fix`, `docs`, `test`, `refactor`, `perf`, `chore`, `ci`. Add a short entry under **[Unreleased]** in [CHANGELOG.md](CHANGELOG.md) for user-facing changes.

## Reporting bugs & ideas

Open an [issue](https://github.com/krishyaa06/prism-sentinel/issues) with:

- what you expected vs. what happened
- steps to reproduce
- your OS, browser or Node.js version

**Security issues:** please don't open a public issue — contact the maintainer privately via [GitHub](https://github.com/krishyaa06).

## License

By contributing, you agree that your contributions will be licensed under the project's [license](LICENSE).
