package io.mateu.jpa.domain.ui.cruds;

import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class JpaMDDOpenCrudActionViewBuilder implements MDDOpenCRUDActionViewBuilder {

  final ReflectionHelper reflectionHelper;

  @Override
  public Crud buildView(MDDOpenCRUDAction action) throws Exception {
    JpaRpcCrudView jpaRpcCrudView = reflectionHelper.newInstance(JpaRpcCrudView.class);
    jpaRpcCrudView.setAction(action);
    return jpaRpcCrudView;
  }
}
