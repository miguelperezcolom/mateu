package io.mateu.mdd.shared.ui;

import io.mateu.mdd.shared.interfaces.RpcView;

public class MDDUIAccessor {

    static IMDDUI mddui;

    private static IMDDUI get() {
        return mddui;
    }


    public static <F, C> void search(RpcView<F, C> view) {
        if (get() != null) get().search(view);
    }

    public static boolean isEditingNewRecord() {
        return get() != null && get().isEditingNewRecord();
    }


}