# action-extras

**Pins:** the `@Action` knobs the ports gained for 3.0 GA, as members of the page's `actions`:
`sse` + `background` (a streamed background action), `confirmationRequired` with
`confirmationTexts` (title, message, confirm and denial texts), `href`, `js` and `customEvent`.
.NET declares them through `[ActionOptions(...)]`, Python through `@action_options(...)`.

Worth pinning because the ports had no way to declare any of them: a .NET or Python action could
not ask for confirmation, stream, run in the background, open a link or fire a client event.

All knobs ride ONE action on purpose: Java lists `@Action` methods in `Class.getDeclaredMethods()`
order, which the JVM does not specify (it changed between two runs of the same build), so a
fixture with several actions would pin an order no server controls.
