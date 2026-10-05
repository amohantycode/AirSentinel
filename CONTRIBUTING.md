# Contributing

Start with the [development guide](docs/development.md). Use Node.js 22, npm, and a feature branch.

Before opening a pull request:

```bash
npm ci
npm run check
npm run build
npm test
```

Explain the user-visible change, how you verified it, and any assumptions. Include a screenshot for visible interface changes and a regression test for changed behavior where practical. Update API examples or setup instructions when their behavior changes.

Do not commit credentials, local environments, generated build output, or unverified model results. Preserve existing team attribution and copyright notices. Keep observed data, predictions, and constructed examples distinguishable.
