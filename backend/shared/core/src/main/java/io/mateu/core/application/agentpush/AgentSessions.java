package io.mateu.core.application.agentpush;

import io.mateu.uidl.UserFacingException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.function.Consumer;
import java.util.function.IntSupplier;
import lombok.extern.slf4j.Slf4j;

/**
 * The live UI sessions an MCP caller can send UI to (live UI push) — in memory, per process,
 * bounded. One entry per UI session (a browser TAB, an app window), registered by its first {@code
 * _agent-channel} stream, carrying who owns it (the principal), where it is (route, renderer),
 * whether a stream is open, and the callers it was PAIRED to.
 *
 * <p>The rules (who may reach a session, codes, limits) are the contract of {@code
 * conformance/mcp/README.md}, "Live UI push"; the texts are {@link AgentPush}'s.
 *
 * <p>In-process: a cluster needs sticky sessions for the stream AND the MCP endpoint, or the MCP
 * call may land on a node that does not hold the session (it answers "Unknown session").
 */
@Slf4j
public final class AgentSessions {

  private static final String CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  private static final int CODE_LENGTH = 8;
  private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_INSTANT;

  private static final AgentSessions SHARED =
      new AgentSessions(
          Clock.systemUTC(),
          new SecureRandom(),
          AgentPush::ratePerMinute,
          AgentPush::maxSessions,
          AgentPush::maxSessionsPerOwner,
          AgentPush::maxAnonymousSessionsPerAddress);

  /** The process-wide registry (the SSE stream and the MCP endpoint meet here). */
  public static AgentSessions shared() {
    return SHARED;
  }

  /** A message to a UI session: {@code {kind, event, detail}}. */
  public record Message(String kind, String event, Map<String, Object> detail) {}

  /** What {@code mateu_list_sessions} shows of a session. */
  public record Entry(
      String session,
      String user,
      String route,
      String renderer,
      String connectedAt,
      boolean connected,
      boolean paired) {}

  /** An open stream; closing it marks the session disconnected (unless it was replaced). */
  public interface Channel extends AutoCloseable {
    @Override
    void close();
  }

  private static final class Session {
    final String sessionId;
    final String handle;
    final String secretHash;
    final String principal;
    final String owner;

    /** The client address an anonymous session was opened from (null: signed in, or unknown). */
    String address;

    final long registeredSeq;
    String route;
    String renderer;
    Instant connectedAt;
    Instant disconnectedAt;
    Consumer<Message> sink;
    Runnable onReplaced;
    Object channelToken;
    final LinkedHashMap<String, String> pairings = new LinkedHashMap<>();
    boolean capabilityPaired;
    final Deque<Instant> deliveries = new ArrayDeque<>();
    String code;
    Instant codeExpiresAt;

    Session(
        String sessionId,
        String handle,
        String secretHash,
        String principal,
        String owner,
        long seq) {
      this.owner = owner;
      this.sessionId = sessionId;
      this.handle = handle;
      this.secretHash = secretHash;
      this.principal = principal;
      this.registeredSeq = seq;
    }

    boolean connected() {
      return sink != null;
    }
  }

  private final Clock clock;
  private final Random random;
  private final IntSupplier ratePerMinute;
  private final IntSupplier maxSessions;
  private final IntSupplier maxSessionsPerOwner;
  private final IntSupplier maxAnonymousSessionsPerAddress;
  private final Map<String, Session> bySessionId = new HashMap<>();
  private final Map<String, Session> byHandle = new HashMap<>();
  private final Map<String, Session> byCode = new HashMap<>();

  /**
   * The most failure buckets kept: past it the least recently used one goes, so a caller rotating
   * identities cannot grow the map without bound (its address bucket still counts every guess).
   */
  public static final int MAX_FAILURE_BUCKETS = 10_000;

  private final Map<String, Deque<Instant>> pairingFailures =
      new LinkedHashMap<>(16, 0.75f, true) {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, Deque<Instant>> eldest) {
          return size() > MAX_FAILURE_BUCKETS;
        }
      };
  private long seq;

  /** A registry with its own clock, randomness and limits (tests); apps use {@link #shared()}. */
  public AgentSessions(
      Clock clock, Random random, IntSupplier ratePerMinute, IntSupplier maxSessions) {
    this(clock, random, ratePerMinute, maxSessions, () -> AgentPush.DEFAULT_MAX_SESSIONS_PER_OWNER);
  }

  /** The same, with its own cap of sessions per owner. */
  public AgentSessions(
      Clock clock,
      Random random,
      IntSupplier ratePerMinute,
      IntSupplier maxSessions,
      IntSupplier maxSessionsPerOwner) {
    this(
        clock,
        random,
        ratePerMinute,
        maxSessions,
        maxSessionsPerOwner,
        () -> AgentPush.DEFAULT_MAX_ANONYMOUS_SESSIONS_PER_ADDRESS);
  }

  /** The same, with its own cap of anonymous sessions per client address. */
  public AgentSessions(
      Clock clock,
      Random random,
      IntSupplier ratePerMinute,
      IntSupplier maxSessions,
      IntSupplier maxSessionsPerOwner,
      IntSupplier maxAnonymousSessionsPerAddress) {
    this.maxSessionsPerOwner = maxSessionsPerOwner;
    this.maxAnonymousSessionsPerAddress = maxAnonymousSessionsPerAddress;
    this.clock = clock;
    this.random = random;
    this.ratePerMinute = ratePerMinute;
    this.maxSessions = maxSessions;
  }

  // ── the UI side ───────────────────────────────────────────────────────────────────────────

  /**
   * Opens (or reopens) the channel of a UI session: registers it on first use, checks the secret
   * and the principal otherwise, replaces any stream already open (its {@code onReplaced} runs),
   * and sends the session's status first.
   *
   * @param principal the authenticated principal of the UI, or null
   * @param sink where this stream's messages go
   * @param onReplaced called when a newer stream for the same session takes over
   */
  public synchronized Channel open(
      String sessionId,
      String secret,
      String principal,
      String route,
      String renderer,
      Consumer<Message> sink,
      Runnable onReplaced) {
    return open(sessionId, secret, principal, null, route, renderer, sink, onReplaced);
  }

  /**
   * The same, knowing the UI's client address: a signed-in UI's sessions are capped per principal
   * ({@value AgentPush#MAX_SESSIONS_PER_OWNER_PROPERTY}); an anonymous one counts on its own — no
   * stranger sharing its address (a reverse proxy, a NAT) can lock it out — and anonymous sessions
   * are capped per client address only by the much higher {@value
   * AgentPush#MAX_ANONYMOUS_SESSIONS_PER_ADDRESS_PROPERTY}, against one client flooding the
   * registry. Both are inside the global {@value AgentPush#MAX_SESSIONS_PROPERTY}.
   */
  public synchronized Channel open(
      String sessionId,
      String secret,
      String principal,
      String clientAddress,
      String route,
      String renderer,
      Consumer<Message> sink,
      Runnable onReplaced) {
    var now = clock.instant();
    sweep(now);
    requireIds(sessionId, secret);
    var session = bySessionId.get(sessionId);
    if (session == null) {
      var owner = ownerOf(principal, sessionId);
      var address = principal == null ? addressOf(clientAddress) : null;
      if (principal != null
          && countOf(s -> owner.equals(s.owner)) >= maxSessionsPerOwner.getAsInt()
          && !evictOldestDisconnected(s -> owner.equals(s.owner))) {
        throw new UserFacingException(AgentPush.TOO_MANY_SESSIONS);
      }
      if (address != null
          && countOf(s -> address.equals(s.address)) >= maxAnonymousSessionsPerAddress.getAsInt()
          && !evictOldestDisconnected(s -> address.equals(s.address))) {
        throw new UserFacingException(AgentPush.TOO_MANY_SESSIONS);
      }
      if (bySessionId.size() >= maxSessions.getAsInt() && !evictOldestDisconnected(s -> true)) {
        throw new UserFacingException(AgentPush.TOO_MANY_SESSIONS);
      }
      session =
          new Session(sessionId, newHandle(), AgentCaller.sha256(secret), principal, owner, ++seq);
      session.address = address;
      bySessionId.put(sessionId, session);
      byHandle.put(session.handle, session);
    } else {
      owned(session, secret, principal);
    }
    session.route = clip(route, 512);
    session.renderer = clip(renderer, 32);
    var previous = session.onReplaced;
    var token = new Object();
    session.sink = sink;
    session.onReplaced = onReplaced;
    session.channelToken = token;
    session.connectedAt = now;
    session.disconnectedAt = null;
    if (previous != null) {
      try {
        previous.run();
      } catch (RuntimeException ignored) {
        // the old stream is gone anyway
      }
    }
    send(session, status(session));
    var opened = session;
    return () -> closed(opened, token);
  }

  /** A new one-time pairing code for the session: {@code {code, expiresInSeconds}}. */
  public synchronized Map<String, Object> pairingCode(
      String sessionId, String secret, String principal) {
    var now = clock.instant();
    sweep(now);
    requireIds(sessionId, secret);
    var session = bySessionId.get(sessionId);
    if (session == null) {
      throw new UserFacingException(AgentPush.CHANNEL_REFUSED);
    }
    owned(session, secret, principal);
    if (session.code != null) {
      byCode.remove(session.code);
    }
    String code;
    do {
      code = newCode();
    } while (byCode.containsKey(code));
    session.code = code;
    session.codeExpiresAt = now.plusSeconds(AgentPush.PAIRING_TTL_SECONDS);
    byCode.put(code, session);
    var out = new LinkedHashMap<String, Object>();
    out.put("code", code.substring(0, 4) + "-" + code.substring(4));
    out.put("expiresInSeconds", AgentPush.PAIRING_TTL_SECONDS);
    return out;
  }

  /** Removes every pairing of the session (and its pending code) and tells its channel. */
  public synchronized void unpair(String sessionId, String secret, String principal) {
    sweep(clock.instant());
    requireIds(sessionId, secret);
    var session = bySessionId.get(sessionId);
    if (session == null) {
      return;
    }
    owned(session, secret, principal);
    if (session.code != null) {
      byCode.remove(session.code);
      session.code = null;
    }
    session.pairings.clear();
    session.capabilityPaired = false;
    send(session, status(session));
  }

  // ── the MCP side ──────────────────────────────────────────────────────────────────────────

  /** The sessions the caller may send to, most recently registered first. */
  public synchronized List<Entry> visible(AgentCaller caller) {
    sweep(clock.instant());
    var out = new ArrayList<Session>();
    for (var session : bySessionId.values()) {
      if (listable(session, caller)) out.add(session);
    }
    out.sort((a, b) -> Long.compare(b.registeredSeq, a.registeredSeq));
    return out.stream().map(AgentSessions::entry).toList();
  }

  /**
   * How the log names a session: {@code s-} and the first 12 hex digits of the handle's SHA-256.
   * The handle itself is a bearer capability — for an anonymously paired session, whoever holds it
   * can push UI into that tab — so it never goes to a log; the fingerprint lets an operator tell
   * sessions apart and correlate lines, and is the same in .NET and Python.
   */
  public static String fingerprint(String handle) {
    if (handle == null) return "s-none";
    return "s-" + AgentCaller.sha256(handle).substring(0, 12);
  }

  /** Pairs the session whose code this is to the caller (the code dies), and tells the UI. */
  public synchronized Entry pair(AgentCaller caller, String rawCode) {
    return pair(caller, rawCode, null);
  }

  /**
   * Pairs the session whose code this is to the caller (the code dies), and tells the UI. Failed
   * attempts are counted per caller AND per client {@code address} (when known): a caller rotating
   * its agent key is still one address, and anonymous callers at different addresses do not share
   * one bucket (which let one of them lock every other out).
   */
  public synchronized Entry pair(AgentCaller caller, String rawCode, String address) {
    var now = clock.instant();
    sweep(now);
    var where = address == null || address.isBlank() ? null : address.trim();
    var callerBucket =
        caller.isAnonymous() ? (where == null ? "anonymous" : "anonymous@" + where) : caller.key();
    var buckets = new ArrayList<Deque<Instant>>();
    buckets.add(pairingFailures.computeIfAbsent(callerBucket, k -> new ArrayDeque<>()));
    if (where != null) {
      buckets.add(pairingFailures.computeIfAbsent("address:" + where, k -> new ArrayDeque<>()));
    }
    for (var failures : buckets) {
      prune(failures, now);
      if (failures.size() >= AgentPush.MAX_PAIRING_FAILURES) {
        throw new UserFacingException(AgentPush.TOO_MANY_ATTEMPTS);
      }
    }
    var code = normalizeCode(rawCode);
    var session = code == null ? null : byCode.get(code);
    if (session == null) {
      for (var failures : buckets) failures.addLast(now);
      throw new UserFacingException(AgentPush.INVALID_CODE);
    }
    byCode.remove(code);
    session.code = null;
    if (caller.isAnonymous()) {
      session.capabilityPaired = true;
      session.pairings.putIfAbsent("anonymous:" + newHandle(), caller.label());
    } else {
      session.pairings.putIfAbsent(caller.key(), caller.label());
    }
    send(session, status(session));
    log.info(
        "Mateu agent push: caller={} paired session={} (user={})",
        caller.logLabel(),
        fingerprint(session.handle),
        session.principal);
    return entry(session);
  }

  /**
   * Checks that the caller may reach the session and that it is connected, before any expensive
   * work (validation); {@link #deliver} checks again.
   */
  public synchronized void requireReachable(AgentCaller caller, String handle) {
    sweep(clock.instant());
    reachable(caller, handle);
  }

  /**
   * Sends a message to the session the caller may reach: visibility, connection, then the rate
   * limit; logs the delivery at INFO.
   *
   * @param what the log's detail ({@code target=drawer}, {@code event=x}, {@code route=/r})
   * @param bytes the size of the message, for the log
   */
  public synchronized void deliver(
      AgentCaller caller, String handle, Message message, String what, int bytes) {
    var now = clock.instant();
    sweep(now);
    var session = reachable(caller, handle);
    prune(session.deliveries, now);
    if (session.deliveries.size() >= ratePerMinute.getAsInt()) {
      throw new UserFacingException(AgentPush.RATE_LIMITED);
    }
    session.deliveries.addLast(now);
    send(session, message);
    log.info(
        "Mateu agent push: caller={} session={} kind={} {} bytes={}",
        caller.logLabel(),
        fingerprint(handle),
        message.kind(),
        io.mateu.core.application.logging.LogSafe.of(what),
        bytes);
  }

  /** Forgets everything (tests). */
  public synchronized void reset() {
    bySessionId.clear();
    byHandle.clear();
    byCode.clear();
    pairingFailures.clear();
  }

  // ── internals ─────────────────────────────────────────────────────────────────────────────

  private Session reachable(AgentCaller caller, String handle) {
    var session = handle == null ? null : byHandle.get(handle);
    if (session == null
        || !(listable(session, caller) || (caller.isAnonymous() && session.capabilityPaired))) {
      throw new UserFacingException(String.format(AgentPush.UNKNOWN_SESSION, handle));
    }
    if (!session.connected()) {
      throw new UserFacingException(String.format(AgentPush.NOT_CONNECTED, handle));
    }
    return session;
  }

  private static boolean listable(Session session, AgentCaller caller) {
    if (caller.principal() != null && caller.principal().equals(session.principal)) {
      return true;
    }
    return caller.key() != null && session.pairings.containsKey(caller.key());
  }

  private static void owned(Session session, String secret, String principal) {
    // constant-time, like the .NET and Python registries: the time a mismatch takes says nothing
    if (!java.security.MessageDigest.isEqual(
            session.secretHash.getBytes(java.nio.charset.StandardCharsets.US_ASCII),
            AgentCaller.sha256(secret).getBytes(java.nio.charset.StandardCharsets.US_ASCII))
        || !java.util.Objects.equals(session.principal, principal)) {
      throw new UserFacingException(AgentPush.CHANNEL_REFUSED);
    }
  }

  private static void requireIds(String sessionId, String secret) {
    if (sessionId == null
        || sessionId.isBlank()
        || sessionId.length() > 128
        || secret == null
        || secret.isBlank()
        || secret.length() > 256) {
      throw new UserFacingException(AgentPush.CHANNEL_REFUSED);
    }
  }

  private synchronized void closed(Session session, Object token) {
    if (session.channelToken != token) {
      return; // replaced by a newer stream, or already closed
    }
    session.sink = null;
    session.onReplaced = null;
    session.channelToken = null;
    session.disconnectedAt = clock.instant();
  }

  private void send(Session session, Message message) {
    var sink = session.sink;
    if (sink == null) return;
    try {
      sink.accept(message);
    } catch (RuntimeException e) {
      log.debug(
          "agent push: the stream of session {} refused a message", fingerprint(session.handle), e);
    }
  }

  private static Message status(Session session) {
    var detail = new LinkedHashMap<String, Object>();
    detail.put("paired", !session.pairings.isEmpty());
    detail.put("agents", new ArrayList<>(new java.util.LinkedHashSet<>(session.pairings.values())));
    return new Message("status", AgentPush.STATUS_EVENT, detail);
  }

  private static Entry entry(Session session) {
    return new Entry(
        session.handle,
        session.principal,
        session.route != null ? session.route : "",
        session.renderer != null ? session.renderer : "",
        session.connectedAt != null
            ? ISO.format(session.connectedAt.truncatedTo(ChronoUnit.SECONDS))
            : null,
        session.connected(),
        !session.pairings.isEmpty());
  }

  /** How many failure buckets are held (tests). */
  synchronized int failureBuckets() {
    return pairingFailures.size();
  }

  private void sweep(Instant now) {
    var expiredBefore = now.minusSeconds(AgentPush.GRACE_SECONDS);
    var gone = new ArrayList<Session>();
    for (var session : bySessionId.values()) {
      if (!session.connected()
          && session.disconnectedAt != null
          && session.disconnectedAt.isBefore(expiredBefore)) {
        gone.add(session);
      }
      if (session.code != null && !now.isBefore(session.codeExpiresAt)) {
        byCode.remove(session.code);
        session.code = null;
      }
    }
    gone.forEach(this::forget);
    pairingFailures.values().removeIf(d -> prune(d, now).isEmpty());
  }

  /**
   * Who a session counts against: its principal, else ITSELF — an anonymous session is nobody
   * else's (keyed on the address, every anonymous UI behind one reverse proxy shared a bucket of
   * 20, and 20 open tabs locked everyone else out).
   */
  static String ownerOf(String principal, String sessionId) {
    if (principal != null) return "user:" + principal;
    return "session:" + sessionId;
  }

  /** The client address an anonymous session is capped by, or null when the adapter cannot tell. */
  static String addressOf(String clientAddress) {
    return clientAddress == null || clientAddress.isBlank() ? null : clientAddress.trim();
  }

  private int countOf(java.util.function.Predicate<Session> which) {
    int n = 0;
    for (var session : bySessionId.values()) {
      if (which.test(session)) n++;
    }
    return n;
  }

  /** Evicts the longest-disconnected session among {@code which}. */
  private boolean evictOldestDisconnected(java.util.function.Predicate<Session> which) {
    Session oldest = null;
    for (var session : bySessionId.values()) {
      if (which.test(session)
          && !session.connected()
          && (oldest == null || session.disconnectedAt.isBefore(oldest.disconnectedAt))) {
        oldest = session;
      }
    }
    if (oldest == null) return false;
    forget(oldest);
    return true;
  }

  private void forget(Session session) {
    bySessionId.remove(session.sessionId);
    byHandle.remove(session.handle);
    if (session.code != null) byCode.remove(session.code);
  }

  private static Deque<Instant> prune(Deque<Instant> times, Instant now) {
    var floor = now.minusSeconds(60);
    while (!times.isEmpty() && !times.peekFirst().isAfter(floor)) {
      times.removeFirst();
    }
    return times;
  }

  private String newHandle() {
    var bytes = new byte[18];
    random.nextBytes(bytes);
    return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
  }

  private String newCode() {
    var sb = new StringBuilder(CODE_LENGTH);
    for (int i = 0; i < CODE_LENGTH; i++) {
      sb.append(CODE_ALPHABET.charAt(random.nextInt(CODE_ALPHABET.length())));
    }
    return sb.toString();
  }

  /** Upper case, dashes and spaces dropped; null when it cannot be a code. */
  static String normalizeCode(String raw) {
    if (raw == null) return null;
    var code = raw.replace("-", "").replace(" ", "").toUpperCase(java.util.Locale.ROOT);
    return code.length() == CODE_LENGTH ? code : null;
  }

  /**
   * The most characters of an agent-supplied detail (a route, an event name) a log line carries.
   */
  static final int MAX_LOGGED_DETAIL = 200;

  /**
   * An agent-supplied text as a log line may carry it: control characters (CR/LF above all, which
   * would forge log lines) become {@code ?} and it is clipped — the same in .NET and Python.
   */
  static String logSafe(String text) {
    if (text == null) return "";
    var clipped = clip(text, MAX_LOGGED_DETAIL);
    var out = new StringBuilder(clipped.length());
    for (int i = 0; i < clipped.length(); i++) {
      char c = clipped.charAt(i);
      out.append(c < 0x20 || c == 0x7f ? '?' : c);
    }
    return out.toString();
  }

  private static String clip(String text, int max) {
    if (text == null) return null;
    return text.length() <= max ? text : text.substring(0, max);
  }
}
