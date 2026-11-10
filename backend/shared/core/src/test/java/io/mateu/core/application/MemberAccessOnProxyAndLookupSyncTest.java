package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.application.security.MateuForbiddenException;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.RestAction;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupLabelSupplier;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.Map;
import java.util.concurrent.atomic.AtomicBoolean;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * What a member is guarded with also guards the indirect ways of reaching it: {@code __restfetch__}
 * for a proxied {@code @RestAction} / {@code @RestOptions}, and the lookup actions of a field.
 */
class MemberAccessOnProxyAndLookupSyncTest {

  static final AtomicBoolean SEARCHED = new AtomicBoolean();
  static final AtomicBoolean LABELLED = new AtomicBoolean();

  /** Answers one employee, and says it was asked. */
  public static class Employees implements LookupOptionsSupplier, LookupLabelSupplier {
    @Override
    public ListingData<Option> search(
        String fieldName, String searchText, Pageable pageable, HttpRequest httpRequest) {
      SEARCHED.set(true);
      return ListingData.of(new Option("1", "Ada"));
    }

    @Override
    public String label(String fieldName, Object id, HttpRequest httpRequest) {
      LABELLED.set(true);
      return "Ada";
    }
  }

  @SuppressWarnings("unused")
  @UI("/member-access")
  public static class Screen {
    @EyesOnly(roles = "hr")
    @Lookup(search = Employees.class)
    public String manager;

    @EyesOnly(roles = "hr")
    @Searchable(label = Employees.class)
    public String coach;

    @EyesOnly(roles = "hr")
    @RestOptions(url = "http://127.0.0.1:1/options", proxy = true)
    public String region;

    @Button
    @EyesOnly(roles = "admin")
    @RestAction(url = "http://127.0.0.1:1/purge", method = "DELETE", proxy = true)
    public void purge() {}

    @Button
    @DisabledUnless(roles = "admin")
    @RestAction(url = "http://127.0.0.1:1/archive", proxy = true)
    public void archive() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Screen.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    SEARCHED.set(false);
    LABELLED.set(false);
  }

  private static RunActionRqDto rq(String actionId, Map<String, Object> parameters) {
    return RunActionRqDto.builder()
        .route("/member-access")
        .actionId(actionId)
        .serverSideType(Screen.class.getName())
        .parameters(parameters)
        .build();
  }

  private static RunActionRqDto proxied(String kind, String id) {
    return rq("__restfetch__", Map.of("_sourceKind", kind, "_sourceId", id));
  }

  private static void assertRefused(RunActionRqDto rq) {
    assertThatThrownBy(() -> mateu.run(rq)).isInstanceOf(MateuForbiddenException.class);
  }

  /** Allowed: the source was called, and the closed port answers a transport failure. */
  private static void assertReachesTheEndpoint(RunActionRqDto rq, String role) {
    var increment = mateu.run(rq, TestIdentities.headersWithRoles(role));
    assertThat(increment.appData().toString()).contains("_restfetchError");
  }

  @Test
  void aProxiedActionIsRefusedToWhoMayNotSeeIt() {
    assertRefused(proxied("action", "purge"));
    assertReachesTheEndpoint(proxied("action", "purge"), "admin");
  }

  @Test
  void aProxiedActionIsRefusedToWhoMayNotEnableIt() {
    assertRefused(proxied("action", "archive"));
    assertReachesTheEndpoint(proxied("action", "archive"), "admin");
  }

  @Test
  void theProxiedOptionsOfAHiddenFieldAreRefused() {
    assertRefused(proxied("options", "region"));
    assertReachesTheEndpoint(proxied("options", "region"), "hr");
  }

  @Test
  void theLookupOfAHiddenFieldIsRefused() {
    var search = rq("search-manager", Map.of("searchText", ""));
    assertRefused(search);
    assertThat(SEARCHED).isFalse();

    mateu.run(search, TestIdentities.headersWithRoles("hr"));
    assertThat(SEARCHED).isTrue();
  }

  @Test
  void theCodeLabelOfAHiddenFieldIsRefused() {
    var code = rq("code-coach", Map.of("code", "1"));
    assertRefused(code);
    assertThat(LABELLED).isFalse();

    mateu.run(code, TestIdentities.headersWithRoles("hr"));
    assertThat(LABELLED).isTrue();
  }

  @Test
  void theSelectorOfAHiddenFieldIsRefused() {
    assertRefused(rq("codesearch-coach", Map.of()));
  }
}
