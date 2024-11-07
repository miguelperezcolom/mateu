package io.mateu.uidl.core.app;

import io.mateu.uidl.core.interfaces.Crud;

public interface MDDOpenCRUDActionViewBuilder {

  Crud buildView(MDDOpenCRUDAction action) throws Exception;
}
