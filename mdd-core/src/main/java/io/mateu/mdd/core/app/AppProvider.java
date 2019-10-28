package io.mateu.mdd.core.app;

import io.mateu.mdd.core.model.authentication.User;

public interface AppProvider {

    AbstractApplication getApp(User user);

}
