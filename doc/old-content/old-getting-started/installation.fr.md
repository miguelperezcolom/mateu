---
title: "Installation"
weight: 2
---

The following steps are here to help you initialize your new website. If you don't know Hugo at all, we strongly suggest you learn more about it by following this [great documentation for beginners](https://gohugo.io/overview/quickstart/).

## Basic configuration

When building the website, you can set a theme by using `--theme` option. However, we suggest you modify the configuration file (`config.toml`) and set the theme as the default.

{{<code `config.toml` `toml`>}}

```toml
# Change the default theme to be use when building the site with Hugo
theme = "Docbox"
```

{{</code>}}

Feel free to edit thoses files by adding some sample content and replacing the `title` value in the beginning of the files.

## Launching the website locally

Launch by using the following command:

{{<code `command line` `console`>}}

```toml
yarn test
```

{{</code>}}

Go to `http://localhost:1313/site/`

## Build the website

When your site is ready to deploy, run the following command:

{{<code `command line` `console`>}}

```toml
yarn build
```

{{</code>}}

A `public` folder will be generated, containing all static content and assets for your website. It can now be deployed on any web server.

{{< notice "info" >}}
This website can be automatically published and hosted with [Netlify](https://www.netlify.com/) (Read more about [Automated HUGO deployments with Netlify](https://www.netlify.com/blog/2015/07/30/hosting-hugo-on-netlifyinsanely-fast-deploys/)). Alternatively, you can use [Github pages](https://gohugo.io/hosting-and-deployment/hosting-on-github/)
{{< /notice >}}
