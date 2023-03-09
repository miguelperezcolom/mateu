package io.mateu.mdd.core.model.cruds;

import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.interfaces.JpaCrud;

import java.util.List;

public class JpaRpcCrudView implements RpcCrudView {

    private final MDDOpenCRUDAction action;

    public JpaRpcCrudView(MDDOpenCRUDAction action) {
        this.action = action;
    }

    @Override
    public List rpc(Object filters, List list, int offset, int limit) throws Throwable {
        return null;
    }

    @Override
    public int gatherCount(Object filters) throws Throwable {
        return 0;
    }
}
