package io.mateu.core.domain.uidefinitionlanguage.core.app;

import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Crud;

public interface MDDOpenCRUDActionViewBuilder {

  Crud buildView(MDDOpenCRUDAction action) throws Exception;
}
