# app-source-proxied

**Pins (`_appsource`, a YAML case):** a role the `type: AppShell` fills with a proxied source is
called by the server. The source's url is relative and the runners configure no self base url, so
the call fails before leaving the process: `_restfetchError {status: 0}`, where a server that does
not answer `_appsource` would fall through to route resolution.
