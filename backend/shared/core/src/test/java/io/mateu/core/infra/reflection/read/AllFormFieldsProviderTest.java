package io.mateu.core.infra.reflection.read;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Member;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Form-member enumeration: hierarchy order (superclass members first), static and synthetic
 * exclusion, and infrastructure-field filtering.
 */
class AllFormFieldsProviderTest {

  @SuppressWarnings("unused")
  static class BaseForm {
    String inherited = "a";
    static String staticBase = "s";
  }

  @SuppressWarnings("unused")
  static class ChildForm extends BaseForm {
    String own = "b";
    String inherited = "override";
    static String staticChild = "s2";
  }

  private static List<String> names(Class<?> type) {
    return AllFormFieldsProvider.getAllFormFields(type).stream().map(Member::getName).toList();
  }

  @Test
  void inheritedMembersComeBeforeOwnOnes() {
    var names = names(ChildForm.class);
    assertThat(names).containsExactly("inherited", "own");
  }

  @Test
  void staticsAreExcluded() {
    assertThat(names(ChildForm.class)).doesNotContain("staticBase", "staticChild");
  }

  @Test
  void plainClassesListTheirFields() {
    assertThat(names(BaseForm.class)).containsExactly("inherited");
  }
}
