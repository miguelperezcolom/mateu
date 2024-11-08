package io.mateu.uidl.app;

import io.mateu.uidl.interfaces.Crud;

public interface MDDOpenCRUDActionViewBuilder {

  Crud buildView(MDDOpenCRUDAction action) throws Exception;
}
