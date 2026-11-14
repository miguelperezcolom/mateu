package io.mateu.demo.localtool.hardening;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.concurrent.atomic.AtomicBoolean;
import org.springframework.stereotype.Component;

/**
 * The one-time launch token: made at startup, put in the address the tool opens ({@code /?t=…})
 * and exchanged ONCE for a session cookie by {@link LocalToolGuard}. Only the person who ran the
 * command sees it (in their terminal and their browser), so another user of the machine, or a web
 * page probing localhost, cannot drive the tool.
 */
@Component
public class LaunchToken {

  private static final SecureRandom RANDOM = new SecureRandom();

  private final String value = randomSecret();
  private final String session = randomSecret();
  private final AtomicBoolean used = new AtomicBoolean();

  public String value() {
    return value;
  }

  /** The cookie value the token is exchanged for. */
  public String session() {
    return session;
  }

  /** True the first time the right token is shown; false for a wrong one or a second use. */
  public boolean redeem(String candidate) {
    return candidate != null && same(candidate, value) && used.compareAndSet(false, true);
  }

  public boolean isSession(String candidate) {
    return candidate != null && same(candidate, session);
  }

  private static boolean same(String a, String b) {
    return MessageDigest.isEqual(a.getBytes(), b.getBytes()); // constant time
  }

  private static String randomSecret() {
    var bytes = new byte[32];
    RANDOM.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }
}
