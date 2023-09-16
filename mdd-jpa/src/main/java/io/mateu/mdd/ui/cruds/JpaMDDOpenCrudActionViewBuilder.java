package io.mateu.mdd.ui.cruds;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.mdd.core.interfaces.Crud;

@AutoService(MDDOpenCRUDAction.class)
public class JpaMDDOpenCrudActionViewBuilder implements MDDOpenCRUDActionViewBuilder {
  @Override
  public Crud buildView(MDDOpenCRUDAction action) throws Exception {
    return new JpaRpcCrudView(action);
  }
}
