"""The capability vocabulary — the Python mirror of Java's ``io.mateu.uidl.Capabilities``.

An app advertises, on ``AppMetadata.requiredCapabilities``, the tokens it REQUIRES from whatever
renderer/shell hosts it; a renderer advertises what it PROVIDES. Compatibility across the embedding
boundary is negotiated BY CAPABILITY, not by a fixed version window. Most tokens are DERIVED from
the app's own metadata; a developer can also DECLARE extra ones via ``@app(requires=[...])``.

The token strings are the contract shared with the frontend (``libs/mateu`` capabilities.ts), the
Java backend and the .NET port — keep them in step. Adding a capability is additive; never rename
or repurpose an existing token.
"""

#: Server-sent events: long-running actions stream, and/or the AI chat endpoint.
SSE = "sse"

#: An app-scope data source fetched once on boot (AppMetadata.appDataSource).
APP_DATA = "app-data"

#: A named REST source catalogue the surfaces reference by ref.
REST_SOURCES = "rest-sources"

#: The command-center palette FAB (Ask-Oracle pattern).
COMMAND_CENTER = "command-center"

#: Global entity search wired into the ⌘K palette / command center.
GLOBAL_SEARCH = "global-search"

#: The notification inbox bell.
NOTIFICATIONS = "notifications"

#: App-header context selectors (@app_context).
CONTEXT_SELECTORS = "context-selectors"

#: App-header action buttons (AppActionsSupplier).
HEADER_ACTIONS = "header-actions"

#: Every token this build knows about — the set a full renderer PROVIDES.
ALL = frozenset(
    {
        SSE,
        APP_DATA,
        REST_SOURCES,
        COMMAND_CENTER,
        GLOBAL_SEARCH,
        NOTIFICATIONS,
        CONTEXT_SELECTORS,
        HEADER_ACTIONS,
    }
)
