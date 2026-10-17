# app-no-home-content

The first case pinned on a SECOND request (`request.json`): an app that declares only menu items
answers its shell with home `_no_home_route`, and the shell's content slot then loads that sentinel
against the app type. The answer is a plain page of the app class — never the shell again. Both
ports used to answer the shell, which nested itself in its own content area and reloaded forever
(the loop guard's "repeating request" banner at the root of every port app without a home).

A runner sends `request.json` (`route`, `consumedRoute`, `actionId`, `componentState`) to the
case's fixture type instead of the first load.

The request omits `consumedRoute` (the browser sends `""`): Java answers a `""` consumed route with
component route `""` and the ports with `"_empty"` — a known, harmless divergence this case does not
pin.
