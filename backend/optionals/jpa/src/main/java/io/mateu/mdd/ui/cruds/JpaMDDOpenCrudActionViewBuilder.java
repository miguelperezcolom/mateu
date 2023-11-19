package io.mateu.mdd.ui.cruds;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.reflection.ReflectionHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
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
