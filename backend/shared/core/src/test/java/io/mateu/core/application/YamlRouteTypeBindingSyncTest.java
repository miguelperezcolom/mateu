package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.data.Message;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * The YAML access keys of a route bound to a view model ({@code access:}, field locks) protect the
 * VIEW MODEL, not one spelling of the request: the request names the type it talks to ({@code
 * serverSideType}) and the route separately, and sending another route — an unrestricted one, an
 * unknown one, none, a dot-segment trick — with the same type used to run the view model with none
 * of its routes' rules (GA review S1). Now a type bound by authored routes, named at a route that
 * does not bind it, is held to ITS routes: one of them must be reachable for the caller and every
 * one of their locks and refused actions applies.
 */
class YamlRouteTypeBindingSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  public static class PayrollView {
    public double salary = 100;

    @Action
    public Message pay() {
      return new Message("paid " + salary);
    }
  }

  public static class SecretView {
    public double salary = 100;

    @Action
    public Message pay() {
      return new Message("paid " + salary);
    }
  }

  /** Bound by routes.yaml AND routed by its own @UI (GA round 2, J4). */
  @io.mateu.uidl.annotations.UI("/payroll-code")
  public static class PayrollCodeView {
    public double salary = 100;

    @Action
    public Message pay() {
      return new Message("paid " + salary);
    }
  }

  public static class NoteView {
    public String note = "HIDDEN-NOTE-777";
  }

  static final String NOTE = NoteView.class.getName();
  static final String VIEW = PayrollView.class.getName();
  static final String SECRET = SecretView.class.getName();
  static final String CODE = PayrollCodeView.class.getName();

  @TempDir Path dir;

  private Path specs() {
    return SpecsDir.write(
        dir,
        Map.of(
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: payroll
                layout: payroll.yaml
                viewModel: %s
                access: admin
              - route: payroll-locked
                layout: payroll-locked.yaml
                viewModel: %s
              - route: secret
                layout: secret.yaml
                viewModel: %s
                access: admin
              - route: notes
                layout: notes.yaml
                viewModel: %s
              - route: hello
                layout: hello.yaml
              - route: payroll-code-locked
                layout: payroll-locked.yaml
                viewModel: %s
            """
                .formatted(VIEW, VIEW, SECRET, NOTE, CODE),
            "notes.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: FormField
                  id: note
                  label: Note
                  dataType: string
                  eyesOnly: admin
            """,
            "payroll.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: FormField
                  id: salary
                  label: Salary
                  dataType: number
                - type: Button
                  label: Pay
                  actionId: pay
            """,
            "secret.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: FormField
                  id: salary
                  label: Salary
                  dataType: number
                  eyesOnly: admin
            """,
            "hello.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: Text
                  text: hi
            """,
            "payroll-locked.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: FormField
                  id: salary
                  label: Salary
                  dataType: number
                  readOnlyUnless: admin
                - type: Button
                  label: Pay
                  actionId: pay
            """));
  }

  private String outcome(Path root, String type, String route, String action, String... roles) {
    var rq =
        RunActionRqDto.builder()
            .route(route)
            .serverSideType(type)
            .actionId(action)
            .componentState(Map.of("salary", 999))
            .build();
    return SpecsDir.over(
        root,
        cl -> {
          try (var mateu =
              TestMateu.withUisAndBeans(
                  List.of(),
                  PayrollView.class,
                  SecretView.class,
                  NoteView.class,
                  PayrollCodeView.class)) {
            try {
              return JSON.valueToTree(
                      mateu.run(
                          rq,
                          roles.length == 0 ? Map.of() : TestIdentities.headersWithRoles(roles)))
                  .toString();
            } catch (Throwable t) {
              return "THROWN " + t;
            }
          }
        });
  }

  private static final List<String> FOREIGN_ROUTES =
      List.of("/hello", "/nowhere", "", "/payroll-locked/../hello", "/payroll-locked/7");

  @Test
  void theRoutesOfTheTypeDecideWhenTheRequestNamesItAtAnotherRoute() {
    var root = specs();
    // its own routes keep their own rules
    assertThat(outcome(root, VIEW, "/payroll", "pay")).contains("Forbidden", "payroll");
    assertThat(outcome(root, VIEW, "/payroll/x", "pay")).contains("Forbidden");
    assertThat(outcome(root, VIEW, "/payroll-locked", "pay")).contains("paid 100.0");
    // anywhere else, the lock of payroll-locked holds (the caller may reach that route)
    for (var route : FOREIGN_ROUTES) {
      if (route.contains("..")) {
        // a dot segment is refused outright (GA round 2, J1)
        assertThat(outcome(root, VIEW, route, "pay")).as(route).contains("Forbidden");
        continue;
      }
      assertThat(outcome(root, VIEW, route, "pay")).as(route).contains("paid 100.0");
    }
  }

  @Test
  void aTypeOnlyRestrictedRoutesBindIsRefusedAtAnyOtherRoute() {
    var root = specs();
    for (var route : FOREIGN_ROUTES) {
      assertThat(outcome(root, SECRET, route, "pay")).as(route).contains("Forbidden");
    }
    assertThat(outcome(root, SECRET, "/secret", "pay")).contains("Forbidden");
    // an admin passes, and is not locked
    assertThat(outcome(root, SECRET, "/hello", "pay", "admin")).contains("paid 999.0");
    assertThat(outcome(root, VIEW, "/hello", "pay", "admin")).contains("paid 999.0");
  }

  @Test
  void aLoadAtAnotherRouteIsRefusedToo() {
    var root = specs();
    for (var route : FOREIGN_ROUTES) {
      assertThat(outcome(root, SECRET, route, "")).as(route).contains("Forbidden");
    }
  }

  @Test
  void aFieldItsRoutesHideIsNotSentAtAnotherRouteEither() {
    var root = specs();
    assertThat(outcome(root, NOTE, "/notes", "")).doesNotContain("HIDDEN-NOTE-777");
    for (var route : FOREIGN_ROUTES) {
      assertThat(outcome(root, NOTE, route, "")).as(route).doesNotContain("HIDDEN-NOTE-777");
    }
    assertThat(outcome(root, NOTE, "/notes", "", "admin")).contains("HIDDEN-NOTE-777");
  }

  @Test
  void theLocksOfABoundTypeHoldAtItsOwnUiRouteWhetherOrNotTheRequestNamesIt() {
    var root = specs();
    assertThat(outcome(root, CODE, "/payroll-code", "pay")).contains("paid 100.0");
    // naming no type used to skip the union of locks: the route resolved the same class
    assertThat(outcome(root, null, "/payroll-code", "pay")).contains("paid 100.0");
    assertThat(outcome(root, "", "/payroll-code", "pay")).contains("paid 100.0");
    assertThat(outcome(root, null, "/payroll-code", "pay", "admin")).contains("paid 999.0");
  }
}
