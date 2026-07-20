package io.mateu.mdd.demoadminpanel.infra.in.ui.peernav;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PeerNavigationSupplier;

/**
 * Last of three linked employee records — the forward arrow is disabled (null route), the back
 * arrow points to record 2. See {@link EmployeeRecord1}.
 */
@UI("/peer-nav-demo/3")
@Title("Grace Hopper")
@PlainText
public class EmployeeRecord3 implements PeerNavigationSupplier {

  String name = "Grace Hopper";
  String position = "Employee #102";
  String record = "3 of 3";

  @Override
  public PeerNav peers(HttpRequest httpRequest) {
    return new PeerNav("Alan Turing", "/peer-nav-demo/2", null, null);
  }
}
