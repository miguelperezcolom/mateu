package io.mateu.core.infra.jpa;

import io.mateu.uidl.app.MDDOpenCRUDAction;
import io.mateu.uidl.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.uidl.interfaces.Crud;
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
