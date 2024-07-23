package io.mateu.core.domain.uidefinition.shared.interfaces;

public interface PartialForm {

  void save();

  default String confirmationTitle() {
    return "";
  }
  ;

  default String confirmationMessage() {
    return "";
  }
  ;

  default String confirmationAction() {
    return "";
  }

  default boolean validateBefore() {
    return true;
  }
}
