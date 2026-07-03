package io.mateu.core.domain.act;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * The {@code search-<parent>-<column>} action id must be parsed by splitting on the LAST dash, so a
 * dashed parent grid field id (e.g. a nested/inline grid with a prefix) still resolves the right
 * parent and column.
 */
class SearchFieldActionRunnerTest {

  @Test
  void plainLookupFieldHasNoChild() {
    var t = SearchFieldActionRunner.parseSearchTarget("supplierId");
    assertThat(t.parent()).isEqualTo("supplierId");
    assertThat(t.child()).isNull();
  }

  @Test
  void gridColumnSplitsParentAndChild() {
    var t = SearchFieldActionRunner.parseSearchTarget("lines-supplierId");
    assertThat(t.parent()).isEqualTo("lines");
    assertThat(t.child()).isEqualTo("supplierId");
  }

  @Test
  void dashedParentPrefixIsKeptWholeAndOnlyTheColumnIsSplitOff() {
    // The column is always a bare Java identifier (no dash); the parent may carry a dashed prefix.
    var t = SearchFieldActionRunner.parseSearchTarget("nested-form-guestList-supplierId");
    assertThat(t.parent()).isEqualTo("nested-form-guestList");
    assertThat(t.child()).isEqualTo("supplierId");
  }
}
