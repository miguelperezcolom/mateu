package io.mateu.core.application.agentpush;

import io.mateu.core.infra.security.IdentityResolver;
import io.mateu.uidl.interfaces.HttpRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Who calls an MCP push tool: its authenticated principal ({@code user:<name>}), else the agent key
 * it sends in {@value AgentPush#AGENT_KEY_HEADER} when it is at least 16 characters ({@code
 * key:<sha256>} — what the sidecar sends), else nobody (anonymous: {@code key} null).
 *
 * @param key the identity sessions are paired to; null for an anonymous caller
 * @param principal the principal name, or null
 * @param label how the UI names this caller ({@code an agent} unless it is a signed-in user)
 */
public record AgentCaller(String key, String principal, String label) {

  static final String AN_AGENT = "an agent";
  static final int MIN_AGENT_KEY = 16;

  /** An anonymous caller. */
  public static AgentCaller anonymous() {
    return new AgentCaller(null, null, AN_AGENT);
  }

  /** A signed-in caller. */
  public static AgentCaller user(String name) {
    return new AgentCaller("user:" + name, name, name);
  }

  /** A caller identified only by its agent key. */
  public static AgentCaller agentKey(String agentKey) {
    return new AgentCaller("key:" + sha256(agentKey), null, AN_AGENT);
  }

  /** The caller of {@code httpRequest}. */
  public static AgentCaller of(HttpRequest httpRequest) {
    var name = principalOf(httpRequest);
    if (name != null) {
      return user(name);
    }
    String header = null;
    try {
      header = httpRequest != null ? httpRequest.getHeaderValue(AgentPush.AGENT_KEY_HEADER) : null;
    } catch (RuntimeException ignored) {
      // an adapter with no header access
    }
    if (header != null && header.trim().length() >= MIN_AGENT_KEY) {
      return agentKey(header.trim());
    }
    return anonymous();
  }

  /** The authenticated principal name of the request, or null when anonymous. */
  public static String principalOf(HttpRequest httpRequest) {
    var name = IdentityResolver.resolve(httpRequest).name();
    return name == null || name.isBlank() ? null : name;
  }

  /** Whether nothing identifies this caller. */
  public boolean isAnonymous() {
    return key == null;
  }

  /** How the log names it: the user, a key prefix, or anonymous. */
  String logLabel() {
    if (principal != null) return principal;
    if (key != null) return key.substring(0, Math.min(key.length(), 16));
    return "anonymous";
  }

  static String sha256(String text) {
    try {
      var digest = MessageDigest.getInstance("SHA-256");
      return HexFormat.of().formatHex(digest.digest(text.getBytes(StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }
}
