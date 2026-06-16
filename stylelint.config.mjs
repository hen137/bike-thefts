/** @type {import("stylelint").Config} */
const config = {
  extends: ["stylelint-config-standard"],
  rules: {
    "at-rule-no-unknown": [
      true,
      {
        ignoreAtRules: [
          "theme",
          "custom-variant",
          "utility",
          "variant",
          "source",
          "config"
        ]
      }
    ],
    // Tailwind v4 uses @import mid-file (after @theme) — disable position check
    "no-invalid-position-at-import-rule": null
  }
};

export default config;
