---
title: "Customization"
weight: 4
---

**Docbox** has been built to be as configurable as possible.

## Change the logo

In `config.toml` you will find a logo variable. you can change your logo there.

{{<code `config.toml` `toml`>}}

```toml
logo = "images/logo.png"
```

{{</code>}}

{{< notice "tip" >}}
The size of the logo will adapt automatically
{{< /notice >}}

## Change the favicon

If your favicon is a png, just drop off your image in your local `static/images/` folder and name it `favicon.png`

If you need to change this default behavior, create a new file in `layouts/partials/` named `head.html`. Then write something like this:

{{<code `head.html` `html`>}}

```html
<link rel="shortcut icon" href="/images/favicon.png" type="image/x-icon" />
```

{{</code>}}

## Change default colors

**Docbox** support change color. You can change the colors from `exampleSite/data/theme.json` or `data/theme.json`. You can change the colors of the template as you want.

{{<code `theme.json` `json`>}}

```json
{
  "colors": {
    "default": {
      "theme_color": {
        "primary": "#c7e565",
        "secondary": "#90BC00",
        "body": "#fff",
        "border": "#eaeaea",
        "theme_light": "#f5f5f5"
      },
      "text_color": {
        "default": "#666",
        "dark": "#222222",
        "light": "#ceced0"
      }
    }
  },
  "fonts": {
    "font_family": {
      "primary": "IBM+Plex+Mono:wght@300;400;500;600;700",
      "primary_type": "sans-serif",
      "secondary": "Montserrat:wght@300;400;500;600",
      "secondary_type": "sans-serif"
    },
    "font_size": {
      "base": "18",
      "scale": "1.240"
    }
  }
}
```

{{</code>}}
