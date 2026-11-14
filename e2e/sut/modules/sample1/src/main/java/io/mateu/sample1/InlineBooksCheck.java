package io.mateu.sample1;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;

/** {@link InlineBooksCrud}'s store drawn WITHOUT editors: what a test reads to see what is stored. */
@UI("/inline-books-check")
@Title("Stored books")
public class InlineBooksCheck extends AutoCrud<InlineBooksCrud.Book> {

  @Override
  public CrudStore<InlineBooksCrud.Book> store() {
    return InlineBooksCrud.books();
  }
}
