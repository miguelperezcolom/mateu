package io.mateu.sample1.app.locking;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;

/** Optimistic locking on the routed editor (/locked-articles/:id/edit). */
@UI("/locked-articles")
@Title("Locked articles")
public class LockedArticles extends AutoCrud<LockedArticle> {

  static final LockedArticleStore STORE = new LockedArticleStore("a");

  @Override
  public CrudStore<LockedArticle> store() {
    return STORE;
  }
}
