package com.example.uis.basic;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;

/**
 * A form with an admin-only field and an admin-only action: a forged token must not reveal or run
 * them, an authenticated admin may.
 */
@UI("/restricted")
@Title("Restricted form")
public class RestrictedForm {

  public String visibleField = "public";

  @EyesOnly(roles = "admin")
  public String adminOnlyField = "top-secret";

  @Button
  @EyesOnly(roles = "admin")
  public Message adminAction() {
    return new Message("admin action ran");
  }
}
