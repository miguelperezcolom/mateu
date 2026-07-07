package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.TreeSelect;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Tree selects: a @TreeSelect field renders as stereotype treeSelect and its options carry their
 * CHILDREN on the wire (hierarchical option set); leavesOnly travels as treeLeavesOnly.
 */
class TreeSelectSyncTest {

  @SuppressWarnings("unused")
  @UI("/treesel")
  @Title("Tree")
  public static class TreeForm implements OptionsSupplier {

    @TreeSelect String zone;

    @TreeSelect(leavesOnly = true)
    String leafZone;

    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
      return List.of(
          new Option(
              "es", "Spain", List.of(new Option("mca", "Mallorca"), new Option("men", "Menorca"))),
          new Option("pt", "Portugal"));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(TreeForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void treeSelectFieldsCarryHierarchicalOptionsAndTheLeavesOnlyFlag() {
    var increment = mateu.sync("/treesel");
    var fields = new java.util.ArrayList<io.mateu.dtos.FormFieldDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), io.mateu.dtos.FormFieldDto.class, fields);

    var zone = fields.stream().filter(f -> "zone".equals(f.fieldId())).findFirst().orElseThrow();
    assertThat(zone.stereotype()).isEqualTo("treeSelect");
    assertThat(zone.treeLeavesOnly()).isFalse();
    assertThat(zone.options())
        .extracting(io.mateu.dtos.OptionDto::value)
        .containsExactly("es", "pt");
    assertThat(zone.options().get(0).children())
        .extracting(io.mateu.dtos.OptionDto::label)
        .containsExactly("Mallorca", "Menorca");
    assertThat(zone.options().get(1).children()).isEmpty();

    var leafZone =
        fields.stream().filter(f -> "leafZone".equals(f.fieldId())).findFirst().orElseThrow();
    assertThat(leafZone.treeLeavesOnly()).isTrue();
  }
}
