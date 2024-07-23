package io.mateu.core.domain.uidefinition.core.app;

import io.mateu.core.domain.uidefinition.core.interfaces.Crud;

public interface MDDOpenCRUDActionViewBuilder {

  Crud buildView(MDDOpenCRUDAction action) throws Exception;
}
