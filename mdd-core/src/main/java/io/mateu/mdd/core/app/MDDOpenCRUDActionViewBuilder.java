package io.mateu.mdd.core.app;

import io.mateu.mdd.core.interfaces.RpcCrudView;

public interface MDDOpenCRUDActionViewBuilder {

    RpcCrudView buildView(MDDOpenCRUDAction action);

}
