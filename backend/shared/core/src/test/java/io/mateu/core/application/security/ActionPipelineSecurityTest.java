package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.DisabledUnless;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Security regression tests for the action pipeline (review findings C1 and H1). Each probe sends
 * what a hostile client could send to {@code /mateu/v3/**} (or {@code /mateu/mcp}, which shares the
 * pipeline) and asserts that nothing ran and the request was refused.
 *
 * <p>Written against the public entry point only ({@code MateuService.runAction}), so they compile
 * — and fail — on the code before the fix.
 */
class ActionPipelineSecurityTest {

  // ── side-effect witnesses ────────────────────────────────────────────────────

  static final AtomicInteger DELETE_ALL = new AtomicInteger();
  static final AtomicInteger NOT_EXPOSED_CONSTRUCTED = new AtomicInteger();
  static final AtomicInteger NOT_EXPOSED_RAN = new AtomicInteger();
  static final AtomicInteger ADMIN_ONLY_RAN = new AtomicInteger();
  static final AtomicInteger OPS_ONLY_RAN = new AtomicInteger();
  static final AtomicInteger PRIVATE_RAN = new AtomicInteger();
  static final AtomicInteger PUBLIC_BUTTON_RAN = new AtomicInteger();
  static final AtomicInteger PACKAGE_BUTTON_RAN = new AtomicInteger();
  static final AtomicInteger RETURNED_VIEW_RAN = new AtomicInteger();
  static final AtomicInteger SECRET_PAGE_RAN = new AtomicInteger();
  static final List<String> STATIC_INIT = new ArrayList<>();

  // ── fixtures ─────────────────────────────────────────────────────────────────

  /** A repository-like container bean, reachable only by naming its interface. */
  public interface DangerRepo {
    void deleteAll();
  }

  public static class DangerRepoImpl implements DangerRepo {
    @Override
    public void deleteAll() {
      DELETE_ALL.incrementAndGet();
    }
  }

  /** A class on the classpath that no UI exposes: not @UI, not routed, not reachable. */
  public static class NotExposed {
    public String value;

    public NotExposed() {
      NOT_EXPOSED_CONSTRUCTED.incrementAndGet();
    }

    public void run() {
      NOT_EXPOSED_RAN.incrementAndGet();
    }
  }

  /** Loading this class by name must not even run its static initializer. */
  public static class WithStaticInit {
    static {
      STATIC_INIT.add("ran");
    }

    public void run() {}
  }

  /** A page restricted to admins, which the app only links from an admin-only menu. */
  @EyesOnly(roles = "admin")
  public static class SecretPage {
    @Button
    public void reveal() {
      SECRET_PAGE_RAN.incrementAndGet();
    }
  }

  /** What an action returns: a plain class, with no annotation at all. */
  public static class ReturnedView {
    public String note;

    public void confirm() {
      RETURNED_VIEW_RAN.incrementAndGet();
    }
  }

  /** A plain nested view the app holds in a field. */
  public static class Address {
    public String street;
  }

  @UI("/sec")
  public static class SecApp {
    public String name = "server";

    public Address address = new Address();

    // a dependency the container would inject: never view state, never a nested form
    @jakarta.inject.Inject DangerRepo repo = new DangerRepoImpl();

    public SecretPage secretPage;

    @Button
    public void ok() {
      PUBLIC_BUTTON_RAN.incrementAndGet();
    }

    @Button
    void packagePrivateButton() {
      PACKAGE_BUTTON_RAN.incrementAndGet();
    }

    @Toolbar
    @EyesOnly(roles = "admin")
    public void adminOnly() {
      ADMIN_ONLY_RAN.incrementAndGet();
    }

    @Button
    @DisabledUnless(roles = "ops")
    public void opsOnly() {
      OPS_ONLY_RAN.incrementAndGet();
    }

    private void secret() {
      PRIVATE_RAN.incrementAndGet();
    }

    @Button
    public ReturnedView open() {
      return new ReturnedView();
    }

    public Message hello() {
      return new Message("hello");
    }
  }

  private static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUisAndBeans(List.of(new DangerRepoImpl()), SecApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void reset() {
    List.of(
            DELETE_ALL,
            NOT_EXPOSED_CONSTRUCTED,
            NOT_EXPOSED_RAN,
            ADMIN_ONLY_RAN,
            OPS_ONLY_RAN,
            PRIVATE_RAN,
            PUBLIC_BUTTON_RAN,
            PACKAGE_BUTTON_RAN,
            RETURNED_VIEW_RAN,
            SECRET_PAGE_RAN)
        .forEach(counter -> counter.set(0));
  }

  private static RunActionRqDto rq(String serverSideType, String actionId) {
    return rq(serverSideType, actionId, Map.of());
  }

  private static RunActionRqDto rq(
      String serverSideType, String actionId, Map<String, Object> state) {
    return RunActionRqDto.builder()
        .route("/sec")
        .consumedRoute("/sec")
        .serverSideType(serverSideType)
        .actionId(actionId)
        .componentState(state)
        .initiatorComponentId("c1")
        .build();
  }

  private static void assertRefused(ThrowingRunnable call) {
    assertThatThrownBy(call::run)
        .satisfies(
            error -> {
              var names = new ArrayList<String>();
              for (Throwable t = error; t != null; t = t.getCause()) {
                names.add(t.getClass().getSimpleName());
              }
              assertThat(names)
                  .as("refusal in the cause chain")
                  .contains("MateuForbiddenException");
            });
  }

  @FunctionalInterface
  interface ThrowingRunnable {
    void run() throws Throwable;
  }

  private static Map<String, String> token(String... roles) {
    try {
      var claims = new ObjectMapper().writeValueAsBytes(Map.of("roles", List.of(roles)));
      var payload = Base64.getUrlEncoder().withoutPadding().encodeToString(claims);
      return Map.of("Authorization", "Bearer header." + payload + ".sig");
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  private static String serverSideTypeOf(UIIncrementDto increment) {
    return increment.fragments().stream()
        .map(fragment -> fragment.component())
        .filter(ServerSideComponentDto.class::isInstance)
        .map(component -> ((ServerSideComponentDto) component).serverSideType())
        .findFirst()
        .orElse(null);
  }

  // ── C1: the client cannot pick the class or bean ────────────────────────────

  @Test
  void aContainerBeanNamedByItsInterfaceIsNotResolvedNorRun() {
    assertRefused(() -> mateu.run(rq(DangerRepo.class.getName(), "deleteAll")));
    assertThat(DELETE_ALL).hasValue(0);
  }

  @Test
  void anUnexposedClassIsNeitherInstantiatedNorRun() {
    assertRefused(() -> mateu.run(rq(NotExposed.class.getName(), "run")));
    assertThat(NOT_EXPOSED_CONSTRUCTED).hasValue(0);
    assertThat(NOT_EXPOSED_RAN).hasValue(0);
  }

  @Test
  void anUnexposedClassIsNotEvenInitialized() {
    assertRefused(() -> mateu.run(rq(WithStaticInit.class.getName(), "run")));
    assertThat(STATIC_INIT).isEmpty();
  }

  @Test
  void aPlatformClassIsRefused() {
    assertRefused(() -> mateu.run(rq("java.lang.ProcessBuilder", "start")));
    assertRefused(() -> mateu.run(rq("java.lang.Runtime", "exit")));
  }

  @Test
  void aNameThatIsNotAClassNameIsRefused() {
    assertRefused(() -> mateu.run(rq("../../etc/passwd", "x")));
  }

  @Test
  void aClassLevelEyesOnlyTypeIsRefusedWithoutTheRole() {
    assertRefused(() -> mateu.run(rq(SecretPage.class.getName(), "reveal")));
    assertThat(SECRET_PAGE_RAN).hasValue(0);

    mateu.run(rq(SecretPage.class.getName(), "reveal"), token("admin"));
    assertThat(SECRET_PAGE_RAN).hasValue(1);
  }

  // ── H1: only actions run, and only for whom they are meant ─────────────────

  @Test
  void aPrivateMethodIsNotAnAction() {
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "secret")));
    assertThat(PRIVATE_RAN).hasValue(0);
  }

  @Test
  void objectMethodsAndAccessorsAreNotActions() {
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "getClass")));
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "hashCode")));
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "notifyAll")));
  }

  @Test
  void anEyesOnlyActionDoesNotRunWithoutTheRole() {
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "adminOnly")));
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "adminOnly"), token("user")));
    assertThat(ADMIN_ONLY_RAN).hasValue(0);

    mateu.run(rq(SecApp.class.getName(), "adminOnly"), token("admin"));
    assertThat(ADMIN_ONLY_RAN).hasValue(1);
  }

  @Test
  void aDisabledUnlessActionDoesNotRunWithoutTheRole() {
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "opsOnly")));
    assertThat(OPS_ONLY_RAN).hasValue(0);

    mateu.run(rq(SecApp.class.getName(), "opsOnly"), token("ops"));
    assertThat(OPS_ONLY_RAN).hasValue(1);
  }

  @Test
  void aNestedFormActionCannotReachAnInjectedDependency() {
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "nested-form-action-repo-deleteAll")));
    assertThat(DELETE_ALL).hasValue(0);
  }

  @Test
  void aPlainFieldIsNotAnAction() {
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "repo")));
    assertRefused(() -> mateu.run(rq(SecApp.class.getName(), "name")));
  }

  // ── what must keep working ───────────────────────────────────────────────────

  @Test
  void declaredActionsStillRun() {
    mateu.run(rq(SecApp.class.getName(), "ok"));
    mateu.run(rq(SecApp.class.getName(), "packagePrivateButton"));
    var hello = mateu.run(rq(SecApp.class.getName(), "hello"));

    assertThat(PUBLIC_BUTTON_RAN).hasValue(1);
    assertThat(PACKAGE_BUTTON_RAN).hasValue(1);
    assertThat(hello.messages()).extracting(m -> m.text()).contains("hello");
  }

  @Test
  void aViewAnActionReturnedCanBeTalkedToAfterwards() {
    var opened = mateu.run(rq(SecApp.class.getName(), "open"));
    assertThat(serverSideTypeOf(opened)).isEqualTo(ReturnedView.class.getName());

    mateu.run(rq(ReturnedView.class.getName(), "confirm"));
    assertThat(RETURNED_VIEW_RAN).hasValue(1);
  }

  @Test
  void aNestedViewTheAppHoldsIsResolvable() {
    var increment = mateu.run(rq(Address.class.getName(), ""));
    assertThat(increment).isNotNull();
  }

  @Test
  void theRouteLoadStillWorks() {
    var increment = mateu.sync("/sec");
    assertThat(serverSideTypeOf(increment)).isEqualTo(SecApp.class.getName());
  }
}
