package io.mateu.core.domain.uidefinition.springboot;

import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingClass("io.mateu.domain.uidefinition.ui.cruds.JpaMDDOpenCrudActionViewBuilder")
public class FakeMDDOpenCRUDActionViewBuilder implements MDDOpenCRUDActionViewBuilder {
  @Override
  public Crud buildView(MDDOpenCRUDAction action) throws Exception {
    return null;
  }
}
