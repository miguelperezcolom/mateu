package io.mateu.mdd.demoadminpanel.infra.in.ui.peernav;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PeerNavigationSupplier;

/**
 * Middle of three linked employee records — both header arrows enabled (back to record 1, forward
 * to record 3). See {@link EmployeeRecord1}.
 */
@UI("/peer-nav-demo/2")
@Title("Alan Turing")
@PlainText
public class EmployeeRecord2 implements PeerNavigationSupplier {

  String name = "Alan Turing";
  String position = "Employee #101";
  String record = "2 of 3";

  @Override
  public PeerNav peers(HttpRequest httpRequest) {
    return new PeerNav("Ada Lovelace", "/peer-nav-demo", "Grace Hopper", "/peer-nav-demo/3");
  }
}
