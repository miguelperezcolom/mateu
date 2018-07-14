package io.mateu.mdd.core.interfaces;

import java.util.List;

public interface RpcView<F, C> {

    List<C> rpc(F filters, int offset, int limit);

    int gatherCount(F filters);

}
