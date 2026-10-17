# app-extras

Pins the app-level shell extras as they reach the renderers: `commandCenterEnabled` (the
always-present palette FAB, `@App(commandCenter = true)` / `[App(CommandCenter = true)]` /
`@app(command_center=True)`), `notificationsEnabled` (an app implementing the notifications
supplier: the header bell) and `globalSearchEnabled` (an app implementing the global-search
supplier: entity hits in the palette). Each renderer shows the extra only when its flag is set, so a
port losing one hides the feature on every client without an error anywhere.
