package io.mateu.core.application.agentpush;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.uidl.UserFacingException;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/** The registry's rules: addressing, pairing, expiry, limits. */
class AgentSessionsTest {

  static final class MutableClock extends Clock {
    Instant now = Instant.parse("2026-10-19T10:00:00Z");

    @Override
    public ZoneOffset getZone() {
      return ZoneOffset.UTC;
    }

    @Override
    public Clock withZone(java.time.ZoneId zone) {
      return this;
    }

    @Override
    public Instant instant() {
      return now;
    }

    void advance(Duration d) {
      now = now.plus(d);
    }
  }

  MutableClock clock;
  int rate;
  int max;
  AgentSessions sessions;
  final AgentCaller alice = AgentCaller.user("alice");
  final AgentCaller bob = AgentCaller.user("bob");
  final AgentCaller anon = AgentCaller.anonymous();

  @BeforeEach
  void setUp() {
    clock = new MutableClock();
    rate = 3;
    max = 3;
    sessions = new AgentSessions(clock, new Random(7), () -> rate, () -> max);
  }

  List<AgentSessions.Message> open(String id, String principal) {
    var received = new ArrayList<AgentSessions.Message>();
    sessions.open(id, "secret-" + id, principal, "/r", "vaadin", received::add, () -> {});
    return received;
  }

  String handleOf(AgentCaller caller) {
    return sessions.visible(caller).get(0).session();
  }

  AgentSessions.Message message() {
    return new AgentSessions.Message("event", "x", Map.of());
  }

  @Test
  void aSessionIsOnlyVisibleToItsOwnPrincipal() {
    open("ui-1", "alice");
    open("ui-2", "bob");
    assertThat(sessions.visible(alice))
        .extracting(AgentSessions.Entry::user)
        .containsExactly("alice");
    assertThat(sessions.visible(anon)).isEmpty();
    var bobs = handleOf(bob);
    assertThatThrownBy(() -> sessions.deliver(alice, bobs, message(), "", 1))
        .isInstanceOf(UserFacingException.class)
        .hasMessage("Unknown session \"" + bobs + "\".");
  }

  @Test
  void theSecretAndThePrincipalOfTheChannelArePinned() {
    open("ui-1", "alice");
    assertThatThrownBy(
            () -> sessions.open("ui-1", "other", "alice", "/", "vaadin", m -> {}, () -> {}))
        .hasMessage(AgentPush.CHANNEL_REFUSED);
    assertThatThrownBy(
            () -> sessions.open("ui-1", "secret-ui-1", "mallory", "/", "vaadin", m -> {}, () -> {}))
        .hasMessage(AgentPush.CHANNEL_REFUSED);
    assertThatThrownBy(() -> sessions.pairingCode("ui-1", "secret-ui-1", null))
        .hasMessage(AgentPush.CHANNEL_REFUSED);
    assertThatThrownBy(() -> sessions.pairingCode("ui-9", "s", null))
        .hasMessage(AgentPush.CHANNEL_REFUSED);
  }

  @Test
  void aNewChannelReplacesTheOldStream() {
    var replaced = new boolean[1];
    var first = new ArrayList<AgentSessions.Message>();
    var channel =
        sessions.open("ui-1", "s", "alice", "/", "vaadin", first::add, () -> replaced[0] = true);
    var second = new ArrayList<AgentSessions.Message>();
    sessions.open("ui-1", "s", "alice", "/b", "vaadin", second::add, () -> {});
    assertThat(replaced[0]).isTrue();
    channel.close(); // the old stream's close does not disconnect the new one
    sessions.deliver(alice, handleOf(alice), message(), "", 1);
    assertThat(first).hasSize(1); // its status only
    assertThat(second).hasSize(2);
    assertThat(sessions.visible(alice).get(0).route()).isEqualTo("/b");
  }

  @Test
  void aPairingCodeWorksOnceAndExpires() {
    var received = open("ui-1", null);
    var code = (String) sessions.pairingCode("ui-1", "secret-ui-1", null).get("code");
    assertThat(code).matches("[2-9A-HJ-NP-Z]{4}-[2-9A-HJ-NP-Z]{4}");
    var entry = sessions.pair(bob, code.toLowerCase().replace("-", ""));
    assertThat(entry.paired()).isTrue();
    assertThat(received.get(received.size() - 1).detail())
        .isEqualTo(Map.of("paired", true, "agents", List.of("bob")));
    assertThatThrownBy(() -> sessions.pair(bob, code)).hasMessage(AgentPush.INVALID_CODE);
    // bob reaches it now; alice does not
    assertThat(sessions.visible(bob)).hasSize(1);
    assertThat(sessions.visible(alice)).isEmpty();

    var late = (String) sessions.pairingCode("ui-1", "secret-ui-1", null).get("code");
    clock.advance(Duration.ofSeconds(AgentPush.PAIRING_TTL_SECONDS));
    assertThatThrownBy(() -> sessions.pair(alice, late)).hasMessage(AgentPush.INVALID_CODE);
  }

  @Test
  void aNewCodeKillsThePreviousOne() {
    open("ui-1", null);
    var first = (String) sessions.pairingCode("ui-1", "secret-ui-1", null).get("code");
    sessions.pairingCode("ui-1", "secret-ui-1", null);
    assertThatThrownBy(() -> sessions.pair(alice, first)).hasMessage(AgentPush.INVALID_CODE);
  }

  @Test
  void anAnonymousPairingMakesTheHandleTheCapability() {
    open("ui-1", "bob");
    var code = (String) sessions.pairingCode("ui-1", "secret-ui-1", "bob").get("code");
    var handle = sessions.pair(anon, code).session();
    sessions.deliver(anon, handle, message(), "", 1);
    assertThat(sessions.visible(anon)).isEmpty(); // nothing to list it by
    sessions.unpair("ui-1", "secret-ui-1", "bob");
    assertThatThrownBy(() -> sessions.deliver(anon, handle, message(), "", 1))
        .hasMessage("Unknown session \"" + handle + "\".");
  }

  @Test
  void anAgentKeyIsAnIdentityOfItsOwn() {
    open("ui-1", null);
    var sidecar = AgentCaller.agentKey("a-long-enough-agent-key");
    var other = AgentCaller.agentKey("another-long-agent-key");
    var code = (String) sessions.pairingCode("ui-1", "secret-ui-1", null).get("code");
    sessions.pair(sidecar, code);
    assertThat(sessions.visible(sidecar)).hasSize(1);
    assertThat(sessions.visible(other)).isEmpty();
    assertThatThrownBy(() -> sessions.deliver(anon, handleOf(sidecar), message(), "", 1))
        .isInstanceOf(UserFacingException.class);
  }

  @Test
  void failedPairingAttemptsAreLimitedPerCaller() {
    for (int i = 0; i < AgentPush.MAX_PAIRING_FAILURES; i++) {
      assertThatThrownBy(() -> sessions.pair(alice, "ZZZZ-ZZZZ"))
          .hasMessage(AgentPush.INVALID_CODE);
    }
    assertThatThrownBy(() -> sessions.pair(alice, "ZZZZ-ZZZZ"))
        .hasMessage(AgentPush.TOO_MANY_ATTEMPTS);
    // another caller is not affected; and it clears after a minute
    assertThatThrownBy(() -> sessions.pair(bob, "ZZZZ-ZZZZ")).hasMessage(AgentPush.INVALID_CODE);
    clock.advance(Duration.ofSeconds(61));
    assertThatThrownBy(() -> sessions.pair(alice, "ZZZZ-ZZZZ")).hasMessage(AgentPush.INVALID_CODE);
  }

  @Test
  void messagesAreRateLimitedPerSessionOverARollingMinute() {
    var received = open("ui-1", "alice");
    var handle = handleOf(alice);
    for (int i = 0; i < rate; i++) sessions.deliver(alice, handle, message(), "", 1);
    assertThatThrownBy(() -> sessions.deliver(alice, handle, message(), "", 1))
        .hasMessage(AgentPush.RATE_LIMITED);
    clock.advance(Duration.ofSeconds(61));
    sessions.deliver(alice, handle, message(), "", 1);
    assertThat(received).hasSize(1 + rate + 1);
  }

  @Test
  void aDisconnectedSessionIsKeptForTheGraceTimeThenForgotten() {
    var channel = sessions.open("ui-1", "s", "alice", "/", "vaadin", m -> {}, () -> {});
    var handle = handleOf(alice);
    channel.close();
    assertThat(sessions.visible(alice).get(0).connected()).isFalse();
    assertThatThrownBy(() -> sessions.deliver(alice, handle, message(), "", 1))
        .hasMessage("Session \"" + handle + "\" is not connected.");
    // a reconnect within the grace time keeps the handle
    clock.advance(Duration.ofSeconds(AgentPush.GRACE_SECONDS - 1));
    var again = sessions.open("ui-1", "s", "alice", "/", "vaadin", m -> {}, () -> {});
    assertThat(handleOf(alice)).isEqualTo(handle);
    again.close();
    clock.advance(Duration.ofSeconds(AgentPush.GRACE_SECONDS + 1));
    assertThat(sessions.visible(alice)).isEmpty();
  }

  @Test
  void theRegistryIsBoundedEvictingTheOldestDisconnected() {
    var c1 = sessions.open("ui-1", "s", "alice", "/", "vaadin", m -> {}, () -> {});
    sessions.open("ui-2", "s", "alice", "/", "vaadin", m -> {}, () -> {});
    sessions.open("ui-3", "s", "alice", "/", "vaadin", m -> {}, () -> {});
    assertThatThrownBy(() -> sessions.open("ui-4", "s", "alice", "/", "vaadin", m -> {}, () -> {}))
        .hasMessage(AgentPush.TOO_MANY_SESSIONS);
    c1.close();
    sessions.open("ui-4", "s", "alice", "/", "vaadin", m -> {}, () -> {});
    assertThat(sessions.visible(alice)).hasSize(3).allMatch(AgentSessions.Entry::connected);
  }

  @Test
  void handlesAreOpaqueAndDistinctFromTheUiSessionId() {
    open("ui-1", "alice");
    var handle = handleOf(alice);
    assertThat(handle)
        .doesNotContain("ui-1")
        .hasSizeGreaterThanOrEqualTo(22)
        .matches("[A-Za-z0-9_-]+");
  }
}
