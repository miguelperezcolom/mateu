package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.out.componentmapper.FormSectionGrouper.SectionGrouping;
import io.mateu.uidl.annotations.Section;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * {@code group} splits a form's fields into sections: a new section starts when the
 * {@code @Section} name changes, consecutive fields sharing the name (or carrying none) stay in the
 * current section, and unannotated leading fields fall into a default section that inherits the
 * form's column count. Composed (semantic) annotations carrying {@code @Section} must behave
 * exactly like the direct annotation.
 */
class FormSectionGrouperTest {

  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.FIELD)
  @Section(value = "Personal", columns = 3)
  @interface PersonalSection {}

  static class PlainForm {
    String name;
    String surname;
  }

  static class SectionedForm {
    @Section("One")
    String a;

    String b; // no annotation → stays in "One"

    @Section("One")
    String c; // same name → stays in "One"

    @Section(value = "Two", columns = 2)
    String d;
  }

  static class ComposedForm {
    @Section("Intro")
    String before;

    @PersonalSection String name; // composed @Section → must start the "Personal" section

    String email; // follows into "Personal"
  }

  private static List<Field> fieldsOf(Class<?> type, String... names) {
    return Arrays.stream(names)
        .map(
            name -> {
              try {
                return type.getDeclaredField(name);
              } catch (NoSuchFieldException e) {
                throw new IllegalStateException(e);
              }
            })
        .toList();
  }

  @Test
  void unannotatedFieldsFallIntoASingleDefaultSectionWithTheFormColumns() {
    SectionGrouping grouping =
        FormSectionGrouper.group(fieldsOf(PlainForm.class, "name", "surname"), 4);

    assertThat(grouping.sections()).hasSize(1);
    Section section = grouping.sections().get(0);
    assertThat(section.value()).isEmpty();
    assertThat(section.columns()).isEqualTo(4);
    assertThat(grouping.fieldsPerSection().get(section).fields())
        .extracting(Field::getName)
        .containsExactly("name", "surname");
  }

  @Test
  void newSectionStartsOnlyWhenTheSectionNameChanges() {
    SectionGrouping grouping =
        FormSectionGrouper.group(fieldsOf(SectionedForm.class, "a", "b", "c", "d"), 1);

    assertThat(grouping.sections()).extracting(Section::value).containsExactly("One", "Two");
    assertThat(grouping.fieldsPerSection().get(grouping.sections().get(0)).fields())
        .extracting(Field::getName)
        .containsExactly("a", "b", "c");
    assertThat(grouping.fieldsPerSection().get(grouping.sections().get(1)).fields())
        .extracting(Field::getName)
        .containsExactly("d");
  }

  @Test
  void sectionColumnsComeFromTheAnnotation() {
    SectionGrouping grouping = FormSectionGrouper.group(fieldsOf(SectionedForm.class, "a", "d"), 1);

    assertThat(grouping.fieldsPerSection().get(grouping.sections().get(0)).columns()).isEqualTo(1);
    assertThat(grouping.fieldsPerSection().get(grouping.sections().get(1)).columns()).isEqualTo(2);
  }

  @Test
  void composedSectionAnnotationStartsANewSectionLikeTheDirectOne() {
    // Regression: the name-change check used field.getAnnotation(Section.class) directly, which
    // returns null for a composed annotation and blew up with an NPE.
    SectionGrouping grouping =
        FormSectionGrouper.group(fieldsOf(ComposedForm.class, "before", "name", "email"), 1);

    assertThat(grouping.sections()).extracting(Section::value).containsExactly("Intro", "Personal");
    Section personal = grouping.sections().get(1);
    assertThat(personal.columns()).isEqualTo(3);
    assertThat(grouping.fieldsPerSection().get(personal).fields())
        .extracting(Field::getName)
        .containsExactly("name", "email");
  }

  @Test
  void sectionLabelIsDerivedFromTheFirstFieldOfTheSection() {
    SectionGrouping grouping =
        FormSectionGrouper.group(fieldsOf(PlainForm.class, "surname", "name"), 1);

    assertThat(grouping.fieldsPerSection().get(grouping.sections().get(0)).label())
        .isEqualTo("Surname");
  }
}
