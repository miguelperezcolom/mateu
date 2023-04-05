package io.mateu.mdd.shared.interfaces;

import io.mateu.mdd.shared.annotations.Private;

public interface MateuSecurityManager {

    UserPrincipal getPrincipal();

    boolean check(Private annotation);

}
