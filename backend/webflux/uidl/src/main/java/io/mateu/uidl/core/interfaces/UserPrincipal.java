package io.mateu.uidl.core.interfaces;

import java.util.List;

public interface UserPrincipal {

  String getLogin();

  List<String> getRoles();

  String getName();
}
