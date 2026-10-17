package io.mateu.sample1.app.locking;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;

/** Optimistic locking on the create/edit drawer. */
@UI("/locked-articles-drawer")
@Title("Locked articles (drawer)")
public class LockedArticlesInDrawer extends AutoCrud<LockedArticle> {

  static final LockedArticleStore STORE = new LockedArticleStore("d");

  @Override
  public boolean editInDrawer() {
    return true;
  }

  @Override
  public CrudStore<LockedArticle> store() {
    return STORE;
  }
}
