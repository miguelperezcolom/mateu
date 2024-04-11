package io.mateu.mdd.springboot;

import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.mdd.core.interfaces.Crud;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingClass;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingClass("io.mateu.mdd.ui.cruds.JpaMDDOpenCrudActionViewBuilder")
public class FakeMDDOpenCRUDActionViewBuilder implements MDDOpenCRUDActionViewBuilder {
  @Override
  public Crud buildView(MDDOpenCRUDAction action) throws Exception {
    return null;
  }
}
