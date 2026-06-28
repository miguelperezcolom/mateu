// set-env registers the SLDS renderer and disables shadow DOM — it MUST run before mateu-ui
// (ES imports are hoisted, and <mateu-ui> upgrades synchronously when the element is defined).
import './set-env.ts'
import '@infra/ui/mateu-ui'
// SLDS ships global CSS (slds-* classes + --slds hooks) loaded via <link> to src/index.css
// in index.html; rendering in light DOM (see set-env) lets it reach our markup.
