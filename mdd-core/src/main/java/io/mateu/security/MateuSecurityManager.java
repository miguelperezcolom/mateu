package io.mateu.security;

import io.mateu.mdd.shared.interfaces.UserPrincipal;

import javax.servlet.http.HttpSession;

public interface MateuSecurityManager {

    String getName(HttpSession httpSession);

    UserPrincipal getPrincipal(HttpSession httpSession);

    void set(HttpSession httpSession, String name) throws Throwable;

    boolean check(HttpSession httpSession, Private annotation);

}
