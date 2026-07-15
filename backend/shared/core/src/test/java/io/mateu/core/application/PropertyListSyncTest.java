package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.Component;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Property-list sections: @Section(propertyList=true) renders every data field of the section as a
 * read-only property row (plain-text value, label left / value right, divider between rows), while
 * component-holding fields and fields of other sections are untouched.
 */
class PropertyListSyncTest {

  @SuppressWarnings("unused")
  @UI("/property-list")
  @Title("Property list")
  public static class DocumentForm {
    @Section(value = "Documento", propertyList = true)
    @Label("Documento")
    String documento = "12345678X";

    @Label("Nombre")
    String nombre = "María";

    @Label("")
    Callable<Component> extra =
        () -> io.mateu.uidl.data.Text.builder().text("componente intacto").build();

    @Section("Otros")
    @Label("Email")
    String email;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(DocumentForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void propertyListSectionMarksItsDataFieldsAsReadOnlyPropertyRows() {
    var increment = mateu.sync("/property-list");
    var fields =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), FormFieldDto.class);
    assertThat(fields)
        .extracting(FormFieldDto::fieldId, FormFieldDto::propertyRow, FormFieldDto::readOnly)
        .contains(
            org.assertj.core.groups.Tuple.tuple("documento", true, true),
            org.assertj.core.groups.Tuple.tuple("nombre", true, true),
            // fields of other sections are unaffected
            org.assertj.core.groups.Tuple.tuple("email", false, false));
    // the component holder in the propertyList section is not turned into a form field: its
    // component travels untouched
    assertThat(fields).extracting(FormFieldDto::fieldId).doesNotContain("extra");
    var texts =
        FieldKindsSyncTest.collect(
            increment.fragments().get(0).component(), io.mateu.dtos.TextDto.class);
    assertThat(texts).extracting(io.mateu.dtos.TextDto::text).contains("componente intacto");
  }
}
