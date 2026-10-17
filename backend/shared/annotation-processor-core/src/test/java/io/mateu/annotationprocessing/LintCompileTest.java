package io.mateu.annotationprocessing;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.Test;

/** The lint as a consumer meets it: a compile error on the offending declaration. */
public class LintCompileTest {

  private static Javac.Result lint(String source) {
    return Javac.compile(
        List.of(new MateuLintAnnotationProcessor()), Map.of("com.acme.Form", source));
  }

  @Test
  public void contradictoryAnnotationsFailTheCompilation() {
    var result =
        lint(
            """
            package com.acme;
            import io.mateu.uidl.annotations.*;
            public class Form {
              @Hidden @HiddenInEditor String a;
              @Hidden @HiddenInView String b;
              @ReadOnly @EditableOnlyWhenCreating String c;
              String name;
              @Action(fieldsToValidate = "name, surname") public void save() {}
            }
            """);

    assertThat(result.errors())
        .containsExactlyInAnyOrder(
            "[Mateu] @Hidden already hides this field everywhere; @HiddenInEditor is redundant",
            "[Mateu] @Hidden already hides this field everywhere; @HiddenInView is redundant",
            "[Mateu] @ReadOnly and @EditableOnlyWhenCreating are contradictory on the same field",
            "[Mateu] @Action(fieldsToValidate) references unknown field 'surname' in Form");
  }

  /** Two {@code @Action}s on one method arrive as the {@code @Actions} container; both are read. */
  @Test
  public void repeatedActionsAreEachChecked() {
    var result =
        lint(
            """
            package com.acme;
            import io.mateu.uidl.annotations.*;
            public class Form {
              String name;
              @Action(id = "a", fieldsToValidate = "name")
              @Action(id = "b", fieldsToValidate = "ghost")
              public void save() {}
            }
            """);

    assertThat(result.errors())
        .containsExactly(
            "[Mateu] @Action(fieldsToValidate) references unknown field 'ghost' in Form");
  }

  @Test
  public void aCleanFormCompilesWithoutDiagnostics() {
    var result =
        lint(
            """
            package com.acme;
            import io.mateu.uidl.annotations.*;
            public class Form {
              @Hidden("state.x > 1") @HiddenInList String conditional;
              @HiddenInEditor @HiddenInView String partly;
              @ReadOnly String readOnly;
              @EditableOnlyWhenCreating String code;
              @Hidden public String hiddenMethod() { return ""; }
              @Action(fieldsToValidate = " code , readOnly ") public void save() {}
            }
            """);

    assertThat(result.errors()).isEmpty();
  }
}
