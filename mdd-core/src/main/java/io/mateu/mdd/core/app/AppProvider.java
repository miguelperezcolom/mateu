package io.mateu.mdd.core.app;

import io.mateu.mdd.core.interfaces.UserPrincipal;

public interface AppProvider {

    AbstractApplication getApp(UserPrincipal user);

}
