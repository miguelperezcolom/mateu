package io.mateu.mdd.core.app;


import io.mateu.util.interfaces.UserPrincipal;

public interface AppProvider {

    AbstractApplication getApp(UserPrincipal user);

}
