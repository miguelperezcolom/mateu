package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.PanelWidth;
import io.mateu.uidl.annotations.Section;
import java.lang.reflect.Field;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.Test;

/**
 * A foldout panel is as wide as what it holds: a few short fields narrow, a longer form medium, a
 * list or a component wide — unless its section fixes the width.
 */
class FoldoutPanelWidthTest {

  static class Model {
    @Section("Holder")
    String first;

    String last;
    String email;

    @Section("Form")
    String a;

    String b;
    String c;
    String d;
    String e;

    @Section("Rooms")
    List<String> rooms;

    @Section("History")
    Callable<Object> history;

    @Section(value = "Forced", panelWidth = PanelWidth.MEDIUM)
    List<String> forced;
  }

  static Field f(String name) throws Exception {
    return Model.class.getDeclaredField(name);
  }

  static Section section(String field) throws Exception {
    return f(field).getAnnotation(Section.class);
  }

  static List<Field> fields(String... names) {
    return Arrays.stream(names)
        .map(
            n -> {
              try {
                return f(n);
              } catch (Exception e) {
                throw new IllegalStateException(e);
              }
            })
        .toList();
  }

  @Test
  void aPanelIsAsWideAsWhatItHolds() throws Exception {
    assertThat(FoldoutDetailRenderer.panelWidth(section("first"), fields("first", "last", "email")))
        .isEqualTo(FoldoutDetailRenderer.NARROW);
    assertThat(FoldoutDetailRenderer.panelWidth(section("a"), fields("a", "b", "c", "d", "e")))
        .isEqualTo(FoldoutDetailRenderer.MEDIUM);
    assertThat(FoldoutDetailRenderer.panelWidth(section("rooms"), fields("rooms")))
        .isEqualTo(FoldoutDetailRenderer.WIDE);
    assertThat(FoldoutDetailRenderer.panelWidth(section("history"), fields("history")))
        .isEqualTo(FoldoutDetailRenderer.WIDE);
  }

  @Test
  void theSectionCanFixIt() throws Exception {
    assertThat(FoldoutDetailRenderer.panelWidth(section("forced"), fields("forced")))
        .isEqualTo(FoldoutDetailRenderer.MEDIUM);
  }
}
