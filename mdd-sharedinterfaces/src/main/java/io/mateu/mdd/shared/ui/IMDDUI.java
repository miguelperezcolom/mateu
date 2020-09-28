package io.mateu.mdd.shared.ui;

import io.mateu.mdd.shared.interfaces.RpcView;

public interface IMDDUI {

    <F, C> void search(RpcView<F,C> fcRpcView);

    boolean isEditingNewRecord();

}
