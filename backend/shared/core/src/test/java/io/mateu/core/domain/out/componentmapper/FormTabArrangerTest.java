package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.interfaces.Pair;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class FormTabArrangerTest {

  static class BareTabs {
    @Tab List<String> steps;
    @Tab List<String> messages;
    @Tab List<String> errors;
  }

  static class NamedTabs {
    @Tab("Info")
    String name;

    @Tab("Info")
    String description;

    @Tab("Audit")
    String createdBy;
  }

  static class MixedTabs {
    String header;

    @Tab("Data")
    String name;

    @Tab String log;
  }

  @Test
  void eachBareTabStartsItsOwnTab() {
    var fieldsPerTab = arrange(BareTabs.class);

    assertThat(fieldsPerTab).hasSize(3);
    assertThat(fieldsPerTab.stream().map(FormTabArranger::getTabName))
        .containsExactly("Steps", "Messages", "Errors");
  }

  @Test
  void consecutiveTabsWithTheSameNameShareOneTab() {
    var fieldsPerTab = arrange(NamedTabs.class);

    assertThat(fieldsPerTab).hasSize(2);
    assertThat(fieldsPerTab.get(0).first().value()).isEqualTo("Info");
    assertThat(fieldsPerTab.get(0).second())
        .extracting(Field::getName)
        .containsExactly("name", "description");
    assertThat(fieldsPerTab.get(1).first().value()).isEqualTo("Audit");
  }

  @Test
  void fieldsBeforeTheFirstTabStayOutsideAndBareTabAfterNamedTabOpensANewOne() {
    var noTabFields = new ArrayList<Field>();
    var fieldsPerTab = arrange(MixedTabs.class, noTabFields);

    assertThat(noTabFields).extracting(Field::getName).containsExactly("header");
    assertThat(fieldsPerTab).hasSize(2);
    assertThat(FormTabArranger.getTabName(fieldsPerTab.get(1))).isEqualTo("Log");
  }

  private static List<Pair<Tab, List<Field>>> arrange(Class<?> type) {
    return arrange(type, new ArrayList<>());
  }

  private static List<Pair<Tab, List<Field>>> arrange(Class<?> type, List<Field> noTabFields) {
    var fieldsPerTab = new ArrayList<Pair<Tab, List<Field>>>();
    FormTabArranger.arrangeInTabs(
        List.of(type.getDeclaredFields()), fieldsPerTab, noTabFields, false, false);
    return fieldsPerTab;
  }
}
