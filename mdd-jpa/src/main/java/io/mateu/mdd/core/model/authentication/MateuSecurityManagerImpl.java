package io.mateu.mdd.core.model.authentication;

import com.google.auto.service.AutoService;
import io.mateu.security.MateuSecurityManager;
import io.mateu.security.Private;

import java.security.Principal;

@AutoService(MateuSecurityManager.class)
public class MateuSecurityManagerImpl implements MateuSecurityManager {
    @Override
    public boolean validate(String login, String password) throws Throwable {
        return false;
    }

    @Override
    public String getName() {
        return null;
    }

    @Override
    public Principal getPrincipal() {
        return null;
    }

    @Override
    public void set(String name) {

    }

    @Override
    public boolean check(Private annotation) {
        return false;
    }

    @Override
    public boolean isProfileAvailable() {
        return false;
    }

    @Override
    public Object getProfile() {
        return null;
    }

    @Override
    public String recoverPassword(String nameOrEmail) {
        return null;
    }
}
