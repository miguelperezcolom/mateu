package com.example.uis.basic;

import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** A form with an admin-only field: a forged token must not reveal it. */
@UI("/restricted")
@Title("Restricted form")
public class RestrictedForm {

  public String visibleField = "public";

  @EyesOnly(roles = "admin")
  public String adminOnlyField = "top-secret";
}
