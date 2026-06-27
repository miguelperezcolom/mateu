// set-env registers the renderer and disables shadow DOM — it MUST run before mateu-ui.
import './set-env.ts'
import '@infra/ui/mateu-ui'
// PatternFly 6 CSS (pf-v6-c-* + tokens) is loaded via <link> to src/index.css in index.html.
