package io.mateu.mdd.core.app;


import io.mateu.mdd.shared.interfaces.UserPrincipal;

public interface AppProvider {

    AbstractApplication getApp(UserPrincipal user);

}
