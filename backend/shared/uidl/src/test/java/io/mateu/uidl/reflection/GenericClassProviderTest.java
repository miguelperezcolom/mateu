package io.mateu.uidl.reflection;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class GenericClassProviderTest {

  interface Rows<Row> {}

  interface Filters<F> {}

  /** The archetype shape: two parameters, the interface takes the SECOND. */
  abstract static class SearchPage<F, Row> implements Rows<Row>, Filters<F> {}

  static class MyFilters {}

  static class MyRow {}

  static class MySearch extends SearchPage<MyFilters, MyRow> {}

  /** A deeper chain that renames and reorders the variables on the way. */
  abstract static class Middle<A, B> extends SearchPage<B, A> {}

  static class Deep extends Middle<MyRow, MyFilters> {}

  static class Direct implements Rows<MyRow> {}

  @Test
  void anInterfaceArgumentIsResolvedByItsPositionInTheDeclaringClass() {
    // Rows<Row> inside SearchPage<F, Row>: Row is SearchPage's SECOND parameter. Read as the
    // first, a HeroSearch/SmartSearchPage listing took its FILTERS class as its rows.
    assertThat(GenericClassProvider.getGenericClass(MySearch.class, Rows.class, "Row"))
        .isEqualTo(MyRow.class);
    assertThat(GenericClassProvider.getGenericClass(MySearch.class, Filters.class, "F"))
        .isEqualTo(MyFilters.class);
  }

  @Test
  void throughARenamingChainToo() {
    assertThat(GenericClassProvider.getGenericClass(Deep.class, Rows.class, "Row"))
        .isEqualTo(MyRow.class);
    assertThat(GenericClassProvider.getGenericClass(Deep.class, Filters.class, "F"))
        .isEqualTo(MyFilters.class);
  }

  @Test
  void aDirectImplementationStillResolves() {
    assertThat(GenericClassProvider.getGenericClass(Direct.class, Rows.class, "Row"))
        .isEqualTo(MyRow.class);
  }
}
