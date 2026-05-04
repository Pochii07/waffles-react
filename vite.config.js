import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// For GitHub Pages: set REPO_NAME to your repository name (e.g. "waffles-react")
// when deploying to https://<user>.github.io/<repo>/. Leave empty for a custom
// domain or username.github.io root.
const repoName = process.env.GITHUB_PAGES_REPO || 'waffles-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? `/${repoName}/` : '/',
}))
