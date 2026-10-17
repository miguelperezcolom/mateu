# welcome-banner

Pins the Redwood "Welcome Banner" element (`@WelcomeBanner` / `[WelcomeBanner]` /
`@welcome_banner`): a centered `HeroSection` with id `welcome-banner` prepended to the page content,
whose title falls back to the page `@Title` when the banner declares none (this case declares only a
subtitle). There is no dedicated wire type — renderers recognise the banner as "any HeroSection in
the tree" (it suppresses the accent strip), so a port emitting the banner under another id, after
the form, or without the title fallback would change the page chrome without an error anywhere.
