# action-extras

**Pins:** the `@Action` knobs the ports gained for 3.0 GA, as members of the page's `actions`:
`sse` + `background` (a streamed background action), `confirmationRequired` with
`confirmationTexts` (title, message, confirm and denial texts), `href`, `js` and `customEvent`.
.NET declares them through `[ActionOptions(...)]`, Python through `@action_options(...)`.

Worth pinning because the ports had no way to declare any of them: a .NET or Python action could
not ask for confirmation, stream, run in the background, open a link or fire a client event.

Note on ORDER: Java lists `@Action` methods in `Class.getDeclaredMethods()` order, which the JVM
does not specify (today: `remove`, `stream`, `pick`, `openDocs`, `runScript`); the ports keep
declaration order, so their fixtures declare the methods in the golden's order. A JDK that
reorders them changes this golden, not the ports.
