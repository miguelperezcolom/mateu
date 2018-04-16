package io.mateu.ui.mdd.server.interfaces;

import io.mateu.ui.core.shared.UserData;

public interface MDDOpenCRUDAction<T> extends MDDAction {

    default String getQueryFilters(UserData user) {
        return null;
    }
}
