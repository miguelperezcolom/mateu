const fs = require("fs");
const path = require("path");
const themePath = path.join(__dirname, "data/theme.json");
const themeRead = fs.readFileSync(themePath, "utf8");
const theme = JSON.parse(themeRead);

let font_base = Number(theme.fonts.font_size.base.replace("px", ""));
let font_scale = Number(theme.fonts.font_size.scale);
let h6 = font_base / font_base;
let h5 = h6 * font_scale;
let h4 = h5 * font_scale;
let h3 = h4 * font_scale;
let h2 = h3 * font_scale;
let h1 = h2 * font_scale;
let fontPrimary, fontPrimaryType, fontSecondary, fontSecondaryType;
if (theme.fonts.font_family.primary) {
  fontPrimary = theme.fonts.font_family.primary
    .replace(/\+/g, " ")
    .replace(/:[ital,]*[ital@]*[wght@]*[0-9,;]+/gi, "");
  fontPrimaryType = theme.fonts.font_family.primary_type;
}
if (theme.fonts.font_family.secondary) {
  fontSecondary = theme.fonts.font_family.secondary
    .replace(/\+/g, " ")
    .replace(/:[ital,]*[ital@]*[wght@]*[0-9,;]+/gi, "");
  fontSecondaryType = theme.fonts.font_family.secondary_type;
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./hugo_stats.json"],
  safelist: [{ pattern: /^swiper-/ }],

  theme: {
    screens: {
      xs: "480px",
      sm: "575px",
      md: "768px",
      lg: "1024px",
      xl: "1200px",
      "2xl": "1400px",
      "3xl": "1600px",
    },
    extend: {
      colors: {
        text: theme.colors.default.text_color.default,
        light: theme.colors.default.text_color.light,
        dark: theme.colors.default.text_color.dark,
        primary: theme.colors.default.theme_color.primary,
        secondary: theme.colors.default.theme_color.secondary,
        body: theme.colors.default.theme_color.body,
        border: theme.colors.default.theme_color.border,
        "theme-light": theme.colors.default.theme_color.theme_light,
        "theme-dark": theme.colors.default.theme_color.theme_dark,
      },
      fontSize: {
        base: font_base + "px",
        h1: h1 + "rem",
        "h1-md": h1 * 0.8 + "rem",
        h2: h2 + "rem",
        "h2-md": h2 * 0.8 + "rem",
        h3: h3 + "rem",
        "h3-md": h3 * 0.8 + "rem",
        h4: h4 + "rem",
        "h4-md": h4 * 0.8 + "rem",
        h5: h5 + "rem",
        "h5-md": h5 * 0.8 + "rem",
        h6: h6 + "rem",
        "h6-md": h6 * 0.8 + "rem",
      },
      fontFamily: {
        primary: [fontPrimary, fontPrimaryType],
        secondary: [fontSecondary, fontSecondaryType],
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("tailwind-bootstrap-grid")({
      generateContainer: false,
      gridGutters: {
        1: "0.25rem",
        2: "0.5rem",
        3: "1rem",
        4: "1.5rem",
        5: "3rem",
      },
    }),
  ],
};
