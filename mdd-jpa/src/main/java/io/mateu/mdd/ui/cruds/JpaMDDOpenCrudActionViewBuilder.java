package io.mateu.mdd.ui.cruds;

import com.google.auto.service.AutoService;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.mdd.core.interfaces.RpcCrudView;

@AutoService(MDDOpenCRUDAction.class)
public class JpaMDDOpenCrudActionViewBuilder implements MDDOpenCRUDActionViewBuilder {
    @Override
    public RpcCrudView buildView(MDDOpenCRUDAction action) {
        return new JpaRpcCrudView(action);
    }
}
