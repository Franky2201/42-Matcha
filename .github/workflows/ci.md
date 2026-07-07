# Team Workflow & CI/CD Guide

For this project, we follow **Trunk-Based Development**. This means we only have one permanent branch: `main`. All new work is done on temporary, short-lived feature branches and merged into `main` via a Pull Request (PR) after passing the CI checks.

---

## Step-by-Step Guide

### 1. Sync Your Local Machine

Before starting any new work, ensure your local environment is up to date with the latest approved code from `main`.

```bash
git checkout main
git pull origin main
```

### 2. Create a Working Branch

Create a new branch for your specific task using the strict naming convention: `type/id-short-description`.

**Allowed Branch Types:**
- `feat`: New features or enhancements
- `fix`: Bug fixes
- `chore`: Tooling setup, configuration, or technical tasks

**Examples:**
```bash
git checkout -b feat/12-login-page
git checkout -b chore/2-setup-docker-db
git checkout -b fix/45-chat-websocket-crash
```

### 3. Development & Testing

Work on your code. If writing tests:
- Use **`pytest`** for backend tests (located under `apps/backend`).
- Write tests using a Vite-compatible testing framework (like Vitest) if added in the future for the frontend.

Before committing or pushing, run the CI validation locally to catch linting, build, or runtime errors early:
```bash
make ci
```
*This command runs the entire pipeline (build, types compilation, linting, tests, production builds) inside isolated Docker containers, guaranteeing identical results to the remote GitHub Actions environment.*

### 4. Stay Synced

Before pushing your changes, merge the latest code from `main` into your feature branch to resolve any conflicts locally.

```bash
git fetch origin main
git merge origin/main
```

### 5. Stage, Commit and Push

When committing, use the strict commit naming convention: `type: short description (#id)`.

```bash
git add .
git commit -m "feat: add github button (#12)"
git push origin feat/12-login-page
```

### 6. Open a Pull Request (PR)

1. Go to the repository on [GitHub.com](https://github.com).
2. Click the green **"Compare & pull request"** button.
3. Add a clear title and a brief description of your changes.
    - **Note:** You can include a closing keyword in the description, such as `Closes #ID` (e.g., `Closes #12`), to automatically link and close the associated GitHub issue when the PR is merged.
4. Opening the PR triggers the remote **CI pipeline** (configured in `ci.yml`), which compiles the code, checks for types, runs linters, and verifies the container setup.

### 7. Merge and Cleanup

- **If the CI build fails (Red X) or reviews request changes**: Analyze the logs on GitHub, fix the issues locally on your branch, commit, and push again. The PR will automatically update and rerun the checks.
- **If the CI passes (Green Check)**: You can merge the PR into `main`.
- **Cleanup**: Delete the branch on GitHub (via the UI) and locally to keep your git tree clean:
  ```bash
  git checkout main
  git pull origin main
  git branch -D feat/12-login-page
  ```
