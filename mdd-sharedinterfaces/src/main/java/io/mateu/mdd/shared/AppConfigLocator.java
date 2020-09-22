package io.mateu.mdd.shared;

public interface AppConfigLocator {

    IAppConfig get() throws Throwable;

    Class getAppConfigClass();

}
