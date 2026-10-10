# NOTICE — `mateu-ui` (Mateu's JET Custom Component for Visual Builder)

Every file in this package is Mateu code, published under the Apache License 2.0
(https://github.com/miguelperezcolom/mateu/blob/master/LICENSE.txt). It is generated from the
Mateu Redwood renderer (`frontend/web/monorepo/apps/redwood` in the Mateu repository).

**It contains nothing from Oracle.** Oracle JET, the Redwood theme, the Spectra components
(`oj-sp-*`) and the Core Pack (`oj-c-*`) are not included: the component uses the ones the HOST
application already loads. When it runs inside an Oracle Visual Builder application it runs
entirely under that application's own Oracle agreement (the Visual Builder / Spectra terms the
customer already has). If the host page has not configured the `oj-sp` / `oj-dynamic` module paths
(a plain JET page, not a Redwood VB app), the component points them at Oracle's CDN — referenced by
URL, never copied.

Oracle, Oracle JET, Redwood and Visual Builder are trademarks of Oracle and/or its affiliates. This
project is not affiliated with or endorsed by Oracle.
