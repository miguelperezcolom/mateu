package io.mateu.core.application.agentpush;

import io.mateu.core.infra.MateuSettings;

/**
 * The switches and limits of live UI push: an MCP caller sending UI (a screen, a navigation, an
 * event) to a UI that is open in a browser tab or an app window. See {@code
 * conformance/mcp/README.md}, "Live UI push".
 *
 * <p><b>OFF by default</b>, and it needs BOTH the MCP endpoint ({@code mateu.mcp.enabled=true}) and
 * its own switch {@value #ENABLED_PROPERTY}{@code =true} (system property, framework configuration
 * or {@code MATEU_MCP_PUSH_ENABLED}, read through {@link MateuSettings}).
 */
public final class AgentPush {

  /** The property that turns live UI push on (with {@code mateu.mcp.enabled}). */
  public static final String ENABLED_PROPERTY = "mateu.mcp.push.enabled";

  /** Messages per session per rolling minute. */
  public static final String RATE_PROPERTY = "mateu.mcp.push.rate-per-minute";

  /** Registered UI sessions, at most. */
  public static final String MAX_SESSIONS_PROPERTY = "mateu.mcp.push.max-sessions";

  /** Registered UI sessions per owner (a principal, or an anonymous UI's client address). */
  public static final String MAX_SESSIONS_PER_OWNER_PROPERTY =
      "mateu.mcp.push.max-sessions-per-owner";

  public static final int DEFAULT_MAX_SESSIONS_PER_OWNER = 20;
  public static final int DEFAULT_RATE_PER_MINUTE = 30;
  public static final int DEFAULT_MAX_SESSIONS = 1000;

  /** How long a pairing code lives. */
  public static final int PAIRING_TTL_SECONDS = 300;

  /** How long a disconnected session (and its pairings) is kept for a reconnect. */
  public static final int GRACE_SECONDS = 120;

  /** Failed pairing attempts per caller per minute. */
  public static final int MAX_PAIRING_FAILURES = 10;

  /** The largest detail of a dispatched event (UTF-8 bytes of its JSON). */
  public static final int MAX_DETAIL_BYTES = 65536;

  // The app-level actions of the UI side.
  public static final String CHANNEL_ACTION = "_agent-channel";
  public static final String PAIR_ACTION = "_agent-pair";
  public static final String UNPAIR_ACTION = "_agent-unpair";

  /** The data key of the pairing answer. */
  public static final String PAIRING_KEY = "_agentPairing";

  /** The header an agent (the sidecar) identifies itself with when it has no principal. */
  public static final String AGENT_KEY_HEADER = "X-Mateu-Agent-Key";

  // The messages' events.
  public static final String STATUS_EVENT = "mateu-agent-status";
  public static final String RENDER_EVENT = "render-screen";
  public static final String NAVIGATE_EVENT = "navigation-requested";
  public static final String CLOSE_EVENT = "close-requested";

  // The texts (pinned by conformance/mcp/push.json).
  public static final String DISABLED = "Live UI push is not enabled.";
  public static final String NOT_CONNECTED = "Session \"%s\" is not connected.";
  public static final String UNKNOWN_SESSION = "Unknown session \"%s\".";
  public static final String RATE_LIMITED =
      "Too many messages to this session; try again in a minute.";
  public static final String INVALID_CODE = "Invalid or expired pairing code.";
  public static final String TOO_MANY_ATTEMPTS =
      "Too many pairing attempts; try again in a minute.";
  public static final String RESERVED_EVENT =
      "Event \"%s\" is reserved: use mateu_push_ui or mateu_navigate.";
  public static final String INVALID_EVENT = "Invalid event name \"%s\".";
  public static final String DETAIL_TOO_LARGE = "The detail is larger than the 65536-byte limit.";
  public static final String INVALID_TARGET =
      "Invalid target \"%s\": use content, drawer or dialog.";
  public static final String CHANNEL_REFUSED = "This UI session belongs to another channel.";
  public static final String TOO_MANY_SESSIONS = "Too many live UI sessions; try again later.";
  public static final String HAS_ERRORS = "The definition has errors; nothing was sent.";
  public static final String NOT_A_PAGE =
      "Only a page (a component, or a layout: envelope) can be pushed.";

  private AgentPush() {}

  /** Whether live UI push is on: the MCP endpoint AND its own switch. */
  public static boolean enabled() {
    return MateuSettings.isTrue(io.mateu.core.application.mcp.McpEndpoint.ENABLED_PROPERTY)
        && MateuSettings.isTrue(ENABLED_PROPERTY);
  }

  /** {@value #RATE_PROPERTY}, default {@value #DEFAULT_RATE_PER_MINUTE}. */
  public static int ratePerMinute() {
    return positive(RATE_PROPERTY, DEFAULT_RATE_PER_MINUTE);
  }

  /** {@value #MAX_SESSIONS_PROPERTY}, default {@value #DEFAULT_MAX_SESSIONS}. */
  public static int maxSessions() {
    return positive(MAX_SESSIONS_PROPERTY, DEFAULT_MAX_SESSIONS);
  }

  /**
   * {@value #MAX_SESSIONS_PER_OWNER_PROPERTY}, default {@value #DEFAULT_MAX_SESSIONS_PER_OWNER}.
   */
  public static int maxSessionsPerOwner() {
    return positive(MAX_SESSIONS_PER_OWNER_PROPERTY, DEFAULT_MAX_SESSIONS_PER_OWNER);
  }

  private static int positive(String key, int fallback) {
    var raw = MateuSettings.get(key);
    if (raw == null) {
      return fallback;
    }
    try {
      var value = Integer.parseInt(raw);
      return value > 0 ? value : fallback;
    } catch (NumberFormatException e) {
      return fallback;
    }
  }
}
