/** @type {import('release-it').Config} */
module.exports = {
  git: {
    commitMessage: "chore: release v${version}",
    tagName: "v${version}",
    tagAnnotation: "Release v${version}",
    requireBranch: "master",
    requireCleanWorkingDir: true,
  },
  github: {
    release: true,
    releaseName: "v${version}",
    // Requires GITHUB_TOKEN environment variable or gh auth token
  },
  npm: {
    // This is a private app, not published to npm
    publish: false,
  },
  plugins: {
    "@release-it/conventional-changelog": {
      preset: {
        name: "conventionalcommits",
        types: [
          { type: "feat", section: "Features" },
          { type: "fix", section: "Bug Fixes" },
          { type: "chore", section: "Chores" },
          { type: "docs", section: "Documentation" },
          { type: "refactor", section: "Refactoring" },
          { type: "perf", section: "Performance" },
          { type: "test", section: "Tests" },
          { type: "ci", section: "CI / CD" },
        ],
      },
      infile: "CHANGELOG.md",
      header:
        "# Changelog\n\nAll notable changes to FlatCheck are documented here.\n",
    },
  },
};
