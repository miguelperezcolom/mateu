package io.mateu.core.domain.out.componentmapper;

import static org.junit.jupiter.api.Assertions.assertEquals;

import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormRow;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Intrinsically wide fields (grids, textareas…) span the full row of a multi-column section by
 * default; an explicit @Colspan (&gt; 1) always wins.
 */
class FormLayoutBuilderTest {

  private FormField field(FieldStereotype stereotype, int colspan) {
    return FormField.builder().id("f").stereotype(stereotype).colspan(colspan).build();
  }

  @Test
  void gridWithDefaultColspanSpansTheFullRowInItsOwnRow() {
    var regular = field(FieldStereotype.regular, 1);
    var grid = field(FieldStereotype.grid, 1);

    var rows = FormLayoutBuilder.buildRows(List.of(regular, grid, regular), 4);

    assertEquals(3, rows.size());
    var gridRow = (FormRow) rows.get(1);
    assertEquals(4, ((FormField) gridRow.content().get(0)).colspan());
  }

  @Test
  void explicitColspanOnAWideFieldWins() {
    var grid = field(FieldStereotype.grid, 2);

    var rows = FormLayoutBuilder.buildRows(List.of(grid), 4);

    var row = (FormRow) rows.get(0);
    assertEquals(2, ((FormField) row.content().get(0)).colspan());
  }

  @Test
  void wideFieldsKeepTheirCellInSingleColumnSections() {
    var grid = field(FieldStereotype.grid, 1);

    var rows = FormLayoutBuilder.buildRows(List.of(grid), 1);

    var row = (FormRow) rows.get(0);
    assertEquals(1, ((FormField) row.content().get(0)).colspan());
  }

  @Test
  void regularFieldsStillPackIntoRowsOfNColumns() {
    var regular = field(FieldStereotype.regular, 1);

    var rows = FormLayoutBuilder.buildRows(List.of(regular, regular, regular, regular, regular), 4);

    assertEquals(2, rows.size());
    assertEquals(4, ((FormRow) rows.get(0)).content().size());
    assertEquals(1, ((FormRow) rows.get(1)).content().size());
  }
}
