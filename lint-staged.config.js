/**
 * @filename: lint-staged.config.mjs
 * @type {import('lint-staged').Configuration}
 */
const config = {
  "*.{ts,tsx}": [
    "eslint --fix --max-warnings 0",
    "prettier --write",
    "vitest related --run"
  ],
  "*.{js,jsx,mjs}": ["eslint --fix", "prettier --write"],
  "*.{css,scss}": ["stylelint --fix", "prettier --write"],
  "*.{json,yaml,yml,toml}": ["prettier --write"],
  "*.md": ["prettier --write", "markdownlint --fix"],
  "*.{png,jpg,jpeg,gif,svg}": ["imagemin-lint-staged"]
};

export default config;
