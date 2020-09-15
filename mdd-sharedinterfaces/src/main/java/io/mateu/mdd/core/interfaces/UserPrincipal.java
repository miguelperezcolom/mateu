package io.mateu.mdd.core.interfaces;

import java.util.List;

public interface UserPrincipal {

    String getLogin();

    List<Long> getPermissionIds();

    String getName();

    String getEmail();

    IResource getPhoto();
}
