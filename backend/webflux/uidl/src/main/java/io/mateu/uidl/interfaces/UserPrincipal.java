package io.mateu.uidl.interfaces;

import java.util.List;

public interface UserPrincipal {

  String getLogin();

  List<String> getRoles();

  String getName();
}
