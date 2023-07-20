# vite-ssr Contributing Guide

👍🎉 First off, thanks for taking the time to contribute! 🎉👍
These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

- [Running the Project Locally](#running-the-project-locally)
- [Pull Request Guidelines](#pull-request-guidelines)

## Running the Project Locally

Make sure you use Node >= 14 first.

1. Clone the project.
2. Run `yarn` at the root to install all the dependencies.
3. Run `yarn dev` at the root to start compiling the TS source and make it available to the examples folder.
4. Move to any directory under `examples/` (vue/etc) and run `yarn dev` (or `yarn dev:spa`).
5. Run `yarn build && yarn serve:node` in any example to test a production build.

Adding new dependencies might require restarting the active processes.

## Pull Request Guidelines

- Checkout a topic branch from a base branch, e.g. `master`, and merge back against that branch.

- If adding a new feature:

  - Provide a convincing reason to add this feature. Ideally, you should open a suggestion issue first and have it approved before working on it.

- If fixing bug:

  - If you are resolving a special issue, add `(fix #xxxx[,#xxxx])` (#xxxx is the issue id) in your PR title for a better release log, e.g. `update entities encoding/decoding (fix #3899)`.
  - Provide a detailed description of the bug in the PR. Live demo preferred.

- It's OK to have multiple small commits as you work on the PR.

- Please use Prettier following the current configuration for this repo.
