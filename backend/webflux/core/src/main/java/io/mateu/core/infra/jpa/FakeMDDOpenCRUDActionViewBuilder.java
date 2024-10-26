package io.mateu.core.infra.jpa;

import io.mateu.core.domain.uidefinitionlanguage.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinitionlanguage.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Crud;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingClass("io.mateu.jpa.domain.ui.cruds.JpaMDDOpenCrudActionViewBuilder")
public class FakeMDDOpenCRUDActionViewBuilder implements MDDOpenCRUDActionViewBuilder {
  @Override
  public Crud buildView(MDDOpenCRUDAction action) {
    return null;
  }
}
