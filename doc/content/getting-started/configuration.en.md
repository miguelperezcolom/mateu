---
title: "Configuration"
weight: 3
---

## Global site parameters

On top of [Hugo global configuration](https://gohugo.io/overview/configuration/), **Dot** lets you define the following parameters in your `config.toml` (here, values are default).

Note that some of these parameters are explained in details in other sections of this documentation.

{{<code `config.toml` `toml`>}}

```toml
# base URL place here
baseURL = "https://examplesite.com"
# this is your site title
title = "Hugo documentation theme"
# theme should be `Docbox`
theme = "Docbox"
# disable language from here
disableLanguages = ["fr"] # now franch language is disabled

# add css plugin
[[params.plugins.css]]
link = "define plugins path"

# add js plugin
[[params.plugins.js]]
link = "define plugins path"

# main menu
[[menu.main]]
name = "contact"
url = "contact/"
weight = 1

# Call to action is default enabled, if you want to disable it. just change the
enable = false

####Default parameters ###########
[params]
logo = "images/logo.png"
# Meta data
description = "This is meta description"
author = "Themefisher"
# contact form action
contact_form_action = "#" # contact form works with https://formspree.io
```

{{</code>}}
