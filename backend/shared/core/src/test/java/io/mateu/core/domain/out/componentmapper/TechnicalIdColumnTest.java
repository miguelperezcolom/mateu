package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PrimaryKey;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridContent;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;

/** W-V-TABLE-ID: the rule that leaves the technical id out of a listing whose rows open. */
class TechnicalIdColumnTest {

  static class Generated {
    UUID id;
    String name;
  }

  static class Named {
    @Label("Code")
    String id;

    String name;
  }

  static class Declared {
    @PrimaryKey String reference;
    String id;
    String name;
  }

  static class NoId {
    String code;
    String name;
  }

  static class OnlyId {
    String id;
  }

  private static List<String> ids(Class<?> row, String... columns) {
    List<GridContent> list =
        java.util.Arrays.stream(columns)
            .map(c -> (GridContent) GridColumn.builder().id(c).label(c).build())
            .toList();
    return TechnicalIdColumn.withoutTechnicalId(row, list).stream()
        .map(c -> ((GridColumn) c).id())
        .toList();
  }

  @Test
  void theDeclaredIdIsLeftOutWhateverItsType() {
    assertThat(ids(Generated.class, "id", "name")).containsExactly("name");
  }

  @Test
  void aLabelledIdIsAColumnTheDeveloperWantsShown() {
    assertThat(ids(Named.class, "id", "name")).containsExactly("id", "name");
  }

  @Test
  void primaryKeyNamesTheIdAndAFieldCalledIdIsThenData() {
    assertThat(ids(Declared.class, "reference", "id", "name")).containsExactly("id", "name");
  }

  @Test
  void theFirstFieldFallbackIsABusinessFieldAndStays() {
    assertThat(ids(NoId.class, "code", "name")).containsExactly("code", "name");
  }

  @Test
  void theOnlyColumnStays() {
    assertThat(ids(OnlyId.class, "id")).containsExactly("id");
  }
}
