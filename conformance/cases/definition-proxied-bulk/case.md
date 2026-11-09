# definition-proxied-bulk

**Pins (`__restfetch__` with `_forEachSelectedRow`, a YAML case):** a definition-only page's proxied
bulk action runs once per selected row, on the server. The url is relative and the runners configure
no self base url, so every row fails and the answer counts them (`3 of 3 failed`): one call without
the rows would report a single failure.
