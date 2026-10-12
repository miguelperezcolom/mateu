package io.mateu.mdd.demoadminpanel.infra.in.ui.e2;

import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** Where the idle-session warning of {@link FrontDeskDemo} signs out to (a real app: its logout). */
@UI("/signed-out-demo")
@Title("Signed out")
public class SignedOutPage {

  @Text
  String text = "You were signed out after a period of inactivity. Open /e2-demo to start again.";
}
