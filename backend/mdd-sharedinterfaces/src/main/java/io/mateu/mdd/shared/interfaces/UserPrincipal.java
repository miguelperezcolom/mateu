package io.mateu.mdd.shared.interfaces;

import java.util.List;

public interface UserPrincipal {

  String getLogin();

  List<String> getRoles();

  String getName();
}
