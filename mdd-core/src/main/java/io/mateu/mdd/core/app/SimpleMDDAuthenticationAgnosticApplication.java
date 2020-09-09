package io.mateu.mdd.core.app;


public class SimpleMDDAuthenticationAgnosticApplication extends SimpleMDDApplication {

    @Override
    public boolean isAuthenticationAgnostic() {
        return true;
    }

}
