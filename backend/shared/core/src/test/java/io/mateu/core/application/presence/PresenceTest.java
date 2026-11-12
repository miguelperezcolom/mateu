package io.mateu.core.application.presence;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.PresenceMember;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

/** The presence rules that do not need a request: records, expiry, bounds, the change feed. */
class PresenceTest {

  private static final Instant T0 = Instant.parse("2026-11-11T10:00:00Z");

  @AfterEach
  void restoreClock() {
    Presence.clock = Clock.systemUTC();
    Presence.resetSweep();
  }

  @Test
  void aRecordIsItsRouteAndViewClass() {
    assertThat(Presence.recordOf("/orders/7", "x.V")).isEqualTo("orders/7|x.V");
    assertThat(Presence.recordOf("orders/7/edit", "x.V")).isEqualTo("orders/7|x.V");
    assertThat(Presence.recordOf("orders/7/view?tab=2", "x.V")).isEqualTo("orders/7|x.V");
    assertThat(Presence.recordOf("//orders//7/", null)).isEqualTo("orders/7|");
    assertThat(Presence.recordOf("orders/new", "x.V")).isNull();
    assertThat(Presence.recordOf("new", "x.V")).isNull();
    assertThat(Presence.recordOf("/", "x.V")).isNull();
    assertThat(Presence.recordOf(null, "x.V")).isNull();
    assertThat(Presence.recordOf("a".repeat(600), "x.V")).isNull();
  }

  @Test
  void aTabNotSeenForThirtySecondsIsGone() {
    Presence.clock = Clock.fixed(T0, ZoneOffset.UTC);
    Presence.touch("expiry", "r|", "ana", "ana", "t1", false);
    Presence.clock = Clock.fixed(T0.plusSeconds(25), ZoneOffset.UTC);
    assertThat(Presence.snapshot("expiry", "r|", "bob").entries()).hasSize(1);
    Presence.clock = Clock.fixed(T0.plusSeconds(31), ZoneOffset.UTC);
    // filtered out at once, even before a sweep removes it
    assertThat(Presence.snapshot("expiry", "r|", "bob").entries()).isEmpty();
    Presence.resetSweep();
    Presence.sweep();
    assertThat(Presence.store().members("expiry", "r|", null)).isEmpty();
  }

  @Test
  void aHeartbeatKeepsItAndKeepsItsSince() {
    Presence.clock = Clock.fixed(T0, ZoneOffset.UTC);
    Presence.touch("hb", "r|", "ana", "ana", "t1", false);
    Presence.clock = Clock.fixed(T0.plusSeconds(20), ZoneOffset.UTC);
    Presence.touch("hb", "r|", "ana", "ana", "t1", true);
    Presence.clock = Clock.fixed(T0.plusSeconds(45), ZoneOffset.UTC);
    var entries = Presence.snapshot("hb", "r|", "bob").entries();
    assertThat(entries).hasSize(1);
    assertThat(entries.get(0).editing()).isTrue();
    assertThat(entries.get(0).since()).isEqualTo(T0.toString());
    Presence.leave("hb", "r|", "ana", "t1");
  }

  @Test
  void theStoreIsBounded() {
    var store = new InMemoryPresenceStore();
    for (int i = 0; i < InMemoryPresenceStore.MAX_MEMBERS_PER_RECORD; i++) {
      assertThat(store.touch("s", "r", member("p" + i, "t"))).isTrue();
    }
    assertThat(store.touch("s", "r", member("one-too-many", "t"))).isFalse();
    // a known copy still refreshes at the bound
    assertThat(store.touch("s", "r", member("p0", "t"))).isTrue();

    for (int i = 0; i < InMemoryPresenceStore.MAX_COPIES_PER_PRINCIPAL; i++) {
      assertThat(store.touch("s", "rec" + i, member("busy", "t"))).isTrue();
    }
    assertThat(store.touch("s", "one-more", member("busy", "t"))).isFalse();
    store.leave("s", "rec0", "busy", "t");
    assertThat(store.touch("s", "one-more", member("busy", "t"))).isTrue();
  }

  @Test
  void theRecordsBoundRefusesNewRecords() {
    var store = new InMemoryPresenceStore();
    for (int i = 0; i < InMemoryPresenceStore.MAX_RECORDS; i++) {
      store.touch("s", "r" + i, member("u" + (i / 40), "t"));
    }
    assertThat(store.size()).isEqualTo(InMemoryPresenceStore.MAX_RECORDS);
    assertThat(store.touch("s", "new-record", member("someone", "t"))).isFalse();
  }

  @Test
  void listenersHearJoinsEditsLeavesAndExpiries() throws Exception {
    var store = new InMemoryPresenceStore();
    var heard = new ArrayList<String>();
    try (var ignored = store.onChange((scope, record) -> heard.add(scope + "/" + record))) {
      store.touch("s", "r", member("ana", "t"));
      store.touch("s", "r", member("ana", "t")); // a plain heartbeat: no change
      store.touch("s", "r", member("ana", "t").toBuilder().editing(true).build());
      store.leave("s", "r", "ana", "t");
      store.touch("s", "r2", member("bob", "t"));
      store.expire(T0.plusSeconds(60));
    }
    assertThat(heard).containsExactly("s/r", "s/r", "s/r", "s/r2", "s/r2");
    assertThat(store.size()).isZero();
  }

  @Test
  void scopesNeverMix() {
    var store = new InMemoryPresenceStore();
    store.touch("app-a", "r", member("ana", "t"));
    assertThat(store.members("app-b", "r", null)).isEmpty();
    assertThat(store.members("app-a", "r", null))
        .extracting(PresenceMember::principal)
        .containsExactly("ana");
  }

  private static PresenceMember member(String principal, String tab) {
    return new PresenceMember(principal, principal, tab, false, T0, T0);
  }

  @SuppressWarnings("unused")
  private static final List<Duration> UNUSED = List.of();
}
