package io.mateu.uidl;

/**
 * The capability vocabulary — the stable tokens an app advertises as REQUIRED (what it needs from
 * whatever renderer/shell hosts it) and a renderer advertises as PROVIDED (what it implements).
 *
 * <p>Compatibility across the embedding boundary is negotiated BY CAPABILITY, not by a fixed
 * version window: a host embeds an app served by a possibly-different backend, and the only honest
 * question is "does the loaded renderer implement everything this app relies on?". The app's {@code
 * AppDto} (and a static bundle's {@code manifest.json}) carries {@code requiredCapabilities}; the
 * renderer holds the set it PROVIDES; on boot the shell compares them and reports what is missing
 * instead of rendering a subtly broken screen. A newer app that needs a token an older renderer
 * bundle does not provide is exactly what this catches — a version number could not, because "3.5"
 * says nothing about which features a build actually implements.
 *
 * <p>Most tokens are DERIVED from the app's own metadata (it needs {@code sse} because it declared
 * an SSE endpoint, {@code command-center} because it opted into it); a developer can also DECLARE
 * extra ones via {@code @App(requires = {...})} for anything the derivation cannot see. The token
 * strings are the contract shared with the frontend ({@code libs/mateu} capabilities.ts) and the
 * {@code .NET}/Python ports — keep the three in step. Adding a capability is additive; never rename
 * or repurpose an existing token, or an old app/bundle would mean something different to a new
 * host.
 */
public final class Capabilities {

  private Capabilities() {}

  /** Server-sent events: long-running actions stream, and/or the AI chat endpoint. */
  public static final String SSE = "sse";

  /** An app-scope data source fetched once on boot ({@code AppDto.appDataSource}). */
  public static final String APP_DATA = "app-data";

  /** A named REST source catalogue the surfaces reference by ref. */
  public static final String REST_SOURCES = "rest-sources";

  /** The command-center palette FAB (Ask-Oracle pattern). */
  public static final String COMMAND_CENTER = "command-center";

  /** Global entity search wired into the ⌘K palette / command center. */
  public static final String GLOBAL_SEARCH = "global-search";

  /** The notification inbox bell. */
  public static final String NOTIFICATIONS = "notifications";

  /** App-header context selectors ({@code @AppContext}). */
  public static final String CONTEXT_SELECTORS = "context-selectors";

  /** App-header action buttons ({@code AppActionsSupplier}). */
  public static final String HEADER_ACTIONS = "header-actions";

  /** Every token this build knows about — the set a full renderer PROVIDES. */
  public static final java.util.Set<String> ALL =
      java.util.Set.of(
          SSE,
          APP_DATA,
          REST_SOURCES,
          COMMAND_CENTER,
          GLOBAL_SEARCH,
          NOTIFICATIONS,
          CONTEXT_SELECTORS,
          HEADER_ACTIONS);
}
