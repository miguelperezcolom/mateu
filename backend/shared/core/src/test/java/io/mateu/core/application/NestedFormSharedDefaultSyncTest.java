package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.UI;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A nested form whose field starts out holding a SHARED object (a static default) is bound into its
 * own copy: the values one caller posts never land in the shared object, so the next caller still
 * loads the default. A per-instance initializer ({@code new Address()}) is per request anyway.
 * Parity pin for the .NET/Python port fixes D8/Y6 ("a nested form is bound into a copy").
 */
class NestedFormSharedDefaultSyncTest {

  public static class Address {
    public String street = "Main Street";
    public String city = "Palma";
  }

  static final Address SHARED_DEFAULT = new Address();
  static final Address SHARED_INLINE_DEFAULT = new Address();

  @UI("/nested-shared-default")
  public static class SharedDefaultForm {
    public String name = "Ada";
    public Address address = SHARED_DEFAULT;
    public String echoed = "";

    @Button
    public Object echo() {
      echoed = "echo:" + address.street;
      return this;
    }
  }

  @UI("/nested-shared-inline-default")
  public static class SharedInlineDefaultForm {
    public String name = "Ada";
    @Inline public final Address address = SHARED_INLINE_DEFAULT;
    public String echoed = "";

    @Button
    public Object echo() {
      echoed = "echo:" + address.street;
      return this;
    }
  }

  @UI("/nested-own-default")
  public static class OwnDefaultForm {
    public String name = "Ada";
    public Address address = new Address();
    public String echoed = "";

    @Button
    public Object echo() {
      echoed = "echo:" + address.street;
      return this;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            SharedDefaultForm.class, SharedInlineDefaultForm.class, OwnDefaultForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(
      String route,
      Class<?> type,
      String actionId,
      Map<String, Object> state,
      Map<String, String> headers) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute("")
            .actionId(actionId)
            .serverSideType(type.getName())
            .componentState(state)
            .initiatorComponentId("c1")
            .build(),
        headers);
  }

  private static String json(UIIncrementDto increment) {
    return io.mateu.core.infra.JsonSerializer.toJson(increment);
  }

  /** What a client may send for the nested form: the nested map AND the flattened keys. */
  private static Map<String, Object> evilState() {
    var nested = new HashMap<String, Object>();
    nested.put("street", "Evil Street");
    nested.put("city", "Nowhere");
    var state = new HashMap<String, Object>();
    state.put("name", "Mallory");
    state.put("address", nested);
    state.put("address-street", "Evil Street");
    state.put("address-city", "Nowhere");
    return state;
  }

  private void callerOnePostsAndCallerTwoSeesTheDefault(String route, Class<?> type) {
    var one = TestIdentities.headersWithRoles("one");
    var two = TestIdentities.headersWithRoles("two");

    var echoed = run(route, type, "echo", evilState(), one);
    // the first caller's values ARE bound for that caller's request
    assertThat(json(echoed)).contains("echo:Evil Street");

    var loaded = run(route, type, "", Map.of(), two);
    // (a final sub-form's values are drawn by its fields but not round-tripped in the state)
    assertThat(json(loaded)).doesNotContain("Evil Street");
    var echoedForTwo = run(route, type, "echo", Map.of(), two);
    assertThat(json(echoedForTwo)).contains("echo:Main Street").doesNotContain("Evil Street");
  }

  @Test
  void aSharedStaticDefaultIsNeverWrittenByACallersNestedValues() {
    callerOnePostsAndCallerTwoSeesTheDefault("/nested-shared-default", SharedDefaultForm.class);
    assertThat(SHARED_DEFAULT.street).isEqualTo("Main Street");
    assertThat(SHARED_DEFAULT.city).isEqualTo("Palma");
  }

  @Test
  void aSharedDefaultHeldByAFinalInlineSubFormIsNeverWritten() {
    callerOnePostsAndCallerTwoSeesTheDefault(
        "/nested-shared-inline-default", SharedInlineDefaultForm.class);
    assertThat(SHARED_INLINE_DEFAULT.street).isEqualTo("Main Street");
    assertThat(SHARED_INLINE_DEFAULT.city).isEqualTo("Palma");
  }

  @Test
  void aPerInstanceInitializerStaysPerRequest() {
    callerOnePostsAndCallerTwoSeesTheDefault("/nested-own-default", OwnDefaultForm.class);
  }
}
