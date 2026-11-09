package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.core.application.runaction.PartialRegistry;
import io.mateu.core.infra.security.ClientLockedFields;
import io.mateu.core.testutil.SpecsDir;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ComponentRef;
import io.mateu.uidl.data.Partial;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

/**
 * Write side of the access keys of a YAML partial (or a {@code components.yaml} business component)
 * drawn inside a JAVA page. The read side ({@link JavaPagePartialAccessSyncTest}) hides or locks
 * the field on screen; this pins that a value the CLIENT POSTS for such a field never reaches the
 * Java view model either. Before, the partial was expanded after the state was hydrated, so its
 * locked fields were unknown at hydration time and a tampered state wrote them.
 */
class JavaPagePartialLockedStateSyncTest {

  private static final ObjectMapper JSON =
      new ObjectMapper()
          .registerModule(new JavaTimeModule())
          .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

  static final AtomicReference<Map<String, Object>> SAVED = new AtomicReference<>();

  @TempDir Path dir;

  /** The fields a partial renders, as the Java view model the page binds them to. */
  public abstract static class PayrollModel implements ComponentTreeSupplier {
    public Double bonus = 10.0;
    public String salaryNote = "kept";
    public String approver = "nobody";
    public String comment = "";

    @Action
    public void save() {
      var values = new LinkedHashMap<String, Object>();
      values.put("bonus", bonus);
      values.put("salaryNote", salaryNote);
      values.put("approver", approver);
      values.put("comment", comment);
      SAVED.set(values);
    }
  }

  @UI("/java-page-locked-partial")
  public static class PageWithPartial extends PayrollModel {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(List.of(new Partial("payroll")));
    }
  }

  @UI("/java-page-locked-component")
  public static class PageWithBusinessComponent extends PayrollModel {
    @Override
    public Component component(HttpRequest httpRequest) {
      return new VerticalLayout(List.of(new ComponentRef("Payroll")));
    }
  }

  /** Draws the {@code bonus-sheet} partial ONLY while {@code showBonus} is true. */
  @UI("/java-page-conditional-partial")
  public static class PageWithConditionalPartial implements ComponentTreeSupplier {
    public boolean showBonus = false;
    public String extra = "kept";
    public String comment = "";

    @Override
    public Component component(HttpRequest httpRequest) {
      return showBonus
          ? new VerticalLayout(List.of(new Partial("bonus-sheet")))
          : new VerticalLayout(List.of());
    }

    @Action
    public void save() {
      var values = new LinkedHashMap<String, Object>();
      values.put("extra", extra);
      values.put("comment", comment);
      SAVED.set(values);
    }
  }

  /** The view model a YAML layout binds (routes.yaml {@code viewModel:}). */
  public static class PayrollViewModel {
    public Double bonus = 10.0;
    public String salaryNote = "kept";
    public String approver = "nobody";
    public String comment = "";

    @Action
    public void save() {
      var values = new LinkedHashMap<String, Object>();
      values.put("bonus", bonus);
      values.put("salaryNote", salaryNote);
      values.put("approver", approver);
      values.put("comment", comment);
      SAVED.set(values);
    }
  }

  private static final String FIELDS =
      """
          - type: FormField
            id: bonus
            label: Bonus
            dataType: number
            readOnlyUnless: {roles: [hr]}
          - type: FormField
            id: salaryNote
            label: Salary note
            dataType: string
            eyesOnly: {roles: [hr]}
          - type: FormField
            id: approver
            label: Approver
            dataType: string
            disabledUnless: {roles: [hr]}
          - type: FormField
            id: comment
            label: Comment
            dataType: string
      """;

  @AfterEach
  void forget() {
    PartialRegistry.instance().reset();
    ClientLockedFields.reset();
    SAVED.set(null);
  }

  private Path fixture() {
    return SpecsDir.write(
        dir,
        Map.of(
            "partials/payroll.yaml",
            "content:\n" + FIELDS,
            "partials/bonus-sheet.yaml",
            """
            content:
              - type: FormField
                id: extra
                label: Extra
                dataType: string
                readOnlyUnless: {roles: [hr]}
            """,
            "routes.yaml",
            """
            type: Routes
            routes:
              - route: yaml-locked-component
                layout: payroll-page.yaml
                viewModel: %s
            """
                .formatted(PayrollViewModel.class.getName()),
            "payroll-page.yaml",
            """
            layout:
              type: VerticalLayout
              content:
                - type: ComponentRef
                  ref: Payroll
            """,
            "components.yaml",
            """
            - name: Payroll
              component:
                type: VerticalLayout
                content:
            """
                + FIELDS.indent(4)));
  }

  private static final Map<String, Object> TAMPERED =
      Map.of("bonus", 999.0, "salaryNote", "hacked", "approver", "mallory", "comment", "hi");

  /** Posts the tampered state to {@code save}; optionally loads the page first in the same run. */
  private String save(String route, Map<String, String> headers, boolean loadFirst) {
    return save(route, headers, loadFirst, TAMPERED);
  }

  private String save(
      String route, Map<String, String> headers, boolean loadFirst, Map<String, Object> posted) {
    return SpecsDir.over(
        fixture(),
        cl -> {
          PartialRegistry.instance().reset();
          ClientLockedFields.reset();
          try (var mateu =
              TestMateu.withUis(
                  PageWithPartial.class,
                  PageWithBusinessComponent.class,
                  PageWithConditionalPartial.class)) {
            if (loadFirst) {
              mateu.run(RunActionRqDto.builder().route(route).actionId("").build(), headers);
            }
            var rq =
                RunActionRqDto.builder()
                    .route(route)
                    .actionId("save")
                    .componentState(new LinkedHashMap<>(posted))
                    .build();
            return JSON.valueToTree(mateu.run(rq, headers)).toString();
          }
        });
  }

  private void assertGuestCannotWrite(String route, boolean loadFirst) {
    var wire = save(route, Map.of(), loadFirst);
    assertThat(SAVED.get())
        .containsEntry("bonus", 10.0)
        .containsEntry("salaryNote", "kept")
        .containsEntry("approver", "nobody")
        .containsEntry("comment", "hi");
    assertThat(wire).doesNotContain("999").doesNotContain("hacked").doesNotContain("mallory");
  }

  private void assertHrCanWrite(String route) {
    save(route, TestIdentities.headersWithRoles("hr"), false);
    assertThat(SAVED.get())
        .containsEntry("bonus", 999.0)
        .containsEntry("salaryNote", "hacked")
        .containsEntry("approver", "mallory")
        .containsEntry("comment", "hi");
  }

  @Test
  void aGuestCannotWriteThePartialsLockedFieldsByPostingThem() {
    assertGuestCannotWrite("/java-page-locked-partial", false);
  }

  @Test
  void aGuestCannotWriteThemEitherOnceThePageHasBeenRendered() {
    assertGuestCannotWrite("/java-page-locked-partial", true);
  }

  @Test
  void aCallerWhoSatisfiesTheAccessKeysWritesThePartialsFields() {
    assertHrCanWrite("/java-page-locked-partial");
  }

  @Test
  void aGuestCannotWriteABusinessComponentsLockedFields() {
    assertGuestCannotWrite("/java-page-locked-component", false);
  }

  @Test
  void aGuestCannotWriteABusinessComponentsLockedFieldsOnceRendered() {
    assertGuestCannotWrite("/java-page-locked-component", true);
  }

  @Test
  void aCallerWhoSatisfiesTheAccessKeysWritesABusinessComponentsFields() {
    assertHrCanWrite("/java-page-locked-component");
  }

  /**
   * STRICT: a page that draws the locked partial only in some state is still guarded when this
   * process has only ever rendered it WITHOUT the partial (the render record is never the source of
   * truth).
   */
  @Test
  void aGuestCannotWriteAFieldOfAPartialThePageDrawsOnlyInAnotherState() {
    var posted = Map.<String, Object>of("showBonus", false, "extra", "hacked", "comment", "hi");
    var wire = save("/java-page-conditional-partial", Map.of(), true, posted);
    assertThat(SAVED.get()).containsEntry("extra", "kept").containsEntry("comment", "hi");
    assertThat(wire).doesNotContain("hacked");
  }

  @Test
  void aCallerWhoSatisfiesTheAccessKeysWritesAConditionalPartialsField() {
    var posted = Map.<String, Object>of("showBonus", false, "extra", "hacked", "comment", "hi");
    save("/java-page-conditional-partial", TestIdentities.headersWithRoles("hr"), true, posted);
    assertThat(SAVED.get()).containsEntry("extra", "hacked").containsEntry("comment", "hi");
  }

  /**
   * A YAML layout bound to a Java view model that names a business component: the component's
   * locked fields are dropped from the posted state too (the page's own access keys already were).
   */
  @Test
  void aGuestCannotWriteABusinessComponentsLockedFieldsThroughAYamlLayout() {
    assertGuestCannotWrite("/yaml-locked-component", false);
  }

  @Test
  void aCallerWhoSatisfiesTheAccessKeysWritesThemThroughAYamlLayout() {
    assertHrCanWrite("/yaml-locked-component");
  }
}
