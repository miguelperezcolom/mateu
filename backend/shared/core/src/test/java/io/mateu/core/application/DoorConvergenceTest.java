package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The three doors must converge.
 *
 * <p>Mateu accepts a screen through several entrances — written as code, drawn in the visual
 * editor, or (once the OpenAPI path lands) derived from an existing API — and the whole proposition
 * rests on all of them landing on the SAME declaration. That is a promise, and a promise nothing
 * checks degrades on its own: two doors drift apart one member at a time and nobody notices,
 * because each one works when you use it alone.
 *
 * <p>What is asserted is the <b>declared surface</b> — the fields a user binds to and the actions a
 * user can fire — not the wrapper structure. The two doors legitimately differ in layout: the code
 * door lets inference choose it, the editor door draws it explicitly. Asserting byte equality would
 * be asserting that the editor cannot lay anything out differently, which is the opposite of the
 * point.
 *
 * <p>The OpenAPI door does not exist yet; when it does, it joins this test rather than getting its
 * own.
 */
class DoorConvergenceTest {

  // ── Door 1: written as code. Layout is inferred from the fields. ─────────────────────────────

  @SuppressWarnings("unused")
  @UI("/convergence-code")
  @Title("Convergence")
  public static class ConvergenceCode {
    public String name = "Ada";
    public int age = 36;

    @Action
    public Message save() {
      return new Message("saved");
    }
  }

  // ── Door 2: drawn in the editor. The YAML carries the layout; this carries only behaviour. ───

  @SuppressWarnings("unused")
  public static class ConvergenceLogic {
    public String name = "Ada";
    public int age = 36;

    @Action
    public Message save() {
      return new Message("saved");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ConvergenceCode.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  /** The fields a user can bind to, as (id, dataType) — order-independent. */
  private static List<String> boundFields(UIIncrementDto increment) {
    var fields = new ArrayList<FormFieldDto>();
    for (var fragment : increment.fragments()) {
      FieldKindsSyncTest.walk(fragment.component(), FormFieldDto.class, fields);
    }
    return fields.stream().map(f -> f.fieldId() + ":" + f.dataType()).distinct().sorted().toList();
  }

  /** The actions a user can fire. */
  private static List<String> actions(UIIncrementDto increment) {
    var actions = new ArrayList<ActionDto>();
    for (var fragment : increment.fragments()) {
      FieldKindsSyncTest.walk(fragment.component(), ActionDto.class, actions);
    }
    return actions.stream()
        .map(ActionDto::id)
        .filter(id -> id != null)
        .distinct()
        .sorted()
        .toList();
  }

  @Test
  void bothDoorsExposeTheSameBoundFields() {
    var code = boundFields(mateu.sync("/convergence-code"));
    var editor = boundFields(mateu.sync("/convergence-yaml"));

    assertThat(code).as("the code door must bind something").isNotEmpty();
    assertThat(editor)
        .as("the same screen drawn in the editor must bind the same fields as written in code")
        .isEqualTo(code);
  }

  @Test
  void bothDoorsExposeTheSameActions() {
    var code = actions(mateu.sync("/convergence-code"));
    var editor = actions(mateu.sync("/convergence-yaml"));

    assertThat(editor)
        .as("the same screen must offer the same actions whichever door declared it")
        .isEqualTo(code);
  }

  @Test
  void theDoorsMayStillLayOutDifferently() {
    // Stated as a test so nobody later "fixes" convergence by asserting byte equality: the editor
    // draws its layout explicitly, and being able to differ there is the reason it exists.
    var code = mateu.sync("/convergence-code");
    var editor = mateu.sync("/convergence-yaml");

    assertThat(code.fragments()).isNotEmpty();
    assertThat(editor.fragments()).isNotEmpty();
  }
}
