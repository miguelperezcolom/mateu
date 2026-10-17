package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AdaptedView;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.ComponentAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Which methods a request may invoke, beyond the plain public-method convention: a model rendered
 * by a {@link ComponentAdapter} exposes exactly the actions its adapted view lists (even
 * package-private ones, never a lifecycle callback or a method it does not list); a class-level
 * {@code @EyesOnly} and a member {@code @DisabledUnless} refuse the call for a caller without the
 * role, and lifecycle callbacks are never actions.
 */
class ActionAccessSyncTest {

  @UI("/adapted-order")
  public static class Order {
    public String status = "NEW";

    void confirm() {
      status = "CONFIRMED";
    }

    void cancelAll() {
      status = "CANCELLED";
    }

    @jakarta.annotation.PostConstruct
    void init() {
      status = "INITIALISED";
    }
  }

  public static class OrderAdapter implements ComponentAdapter<Order> {
    @Override
    public Class<Order> type() {
      return Order.class;
    }

    @Override
    public AdaptedView adapt(Order model, HttpRequest httpRequest) {
      return new AdaptedView(
          List.of(new Text("Order " + model.status)),
          Map.of("status", model.status),
          Map.of(),
          List.of("confirm", "init"));
    }

    @Override
    public Order deserialize(Map<String, Object> state, HttpRequest httpRequest) {
      var order = new Order();
      if (state.containsKey("status")) order.status = String.valueOf(state.get("status"));
      return order;
    }
  }

  @EyesOnly(roles = "admin")
  public static class AdminOnly {
    @Toolbar
    public void act() {}
  }

  public static class Guarded {
    @Toolbar
    @DisabledUnless(roles = "manager")
    public void approve() {}

    @jakarta.annotation.PostConstruct
    public void setUp() {}
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new OrderAdapter()), Order.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static RunActionRqDto rq(String actionId) {
    return RunActionRqDto.builder()
        .route("/adapted-order")
        .consumedRoute("/adapted-order")
        .serverSideType(Order.class.getName())
        .actionId(actionId)
        .componentState(Map.of("status", "NEW"))
        .initiatorComponentId("order")
        .build();
  }

  private static HttpRequest anonymous() {
    return new FakeHttpRequest(RunActionRqDto.builder().route("/").actionId("x").build());
  }

  private static HttpRequest withRoles(String... roles) {
    return new FakeHttpRequest(RunActionRqDto.builder().route("/").actionId("x").build())
        .withPrincipal(TestIdentities.principalWithRoles(roles));
  }

  @Test
  void anActionTheAdaptedViewListsRunsOnTheModelEvenWhenPackagePrivate() {
    var method = ActionMethods.resolve(new Order(), "confirm", anonymous());
    assertThat(method).isNotNull();
    assertThat(method.getName()).isEqualTo("confirm");

    var increment = mateu.run(rq("confirm"));
    assertThat(increment.toString()).contains("CONFIRMED");
  }

  @Test
  void aMethodTheAdaptedViewDoesNotListIsRefused() {
    assertThatThrownBy(() -> ActionMethods.resolve(new Order(), "cancelAll", anonymous()))
        .isInstanceOf(MateuForbiddenException.class)
        .hasMessageContaining("not an action");
  }

  @Test
  void aLifecycleCallbackIsNeverAnActionEvenWhenListedOrPublic() throws Exception {
    assertThatThrownBy(() -> ActionMethods.resolve(new Order(), "init", anonymous()))
        .isInstanceOf(MateuForbiddenException.class);
    assertThat(ActionMethods.isInvocable(Guarded.class.getMethod("setUp"), Guarded.class))
        .isFalse();
  }

  @Test
  void aClassLevelEyesOnlyRefusesEveryActionToACallerWithoutTheRole() {
    assertThatThrownBy(() -> ActionMethods.resolve(new AdminOnly(), "act", anonymous()))
        .isInstanceOf(MateuForbiddenException.class)
        .hasMessageContaining("class-level @EyesOnly not satisfied");
    assertThat(ActionMethods.resolve(new AdminOnly(), "act", withRoles("admin"))).isNotNull();
  }

  @Test
  void disabledUnlessRefusesTheCallNotOnlyTheButton() {
    assertThatThrownBy(() -> ActionMethods.resolve(new Guarded(), "approve", withRoles("clerk")))
        .isInstanceOf(MateuForbiddenException.class)
        .hasMessageContaining("@DisabledUnless not satisfied");
    assertThat(ActionMethods.resolve(new Guarded(), "approve", withRoles("manager"))).isNotNull();
  }

  @Test
  void aMissingMethodIsNothingAndARefusedNameIsAbbreviated() {
    assertThat(ActionMethods.resolve(new Guarded(), "nope", anonymous())).isNull();
    var longName = "x".repeat(500);
    assertThat(ActionMethods.refused(Guarded.class, longName, "why").getMessage())
        .hasSizeLessThan(200)
        .endsWith("… (why)");
  }
}
