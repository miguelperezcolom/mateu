package io.mateu.mdd.demoadminpanel.infra.in.ui.peernav;

import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PeerNavigationSupplier;

/**
 * Demo of lateral peer-object navigation — the Redwood "next/previous object" header arrows,
 * supplied by {@link PeerNavigationSupplier}. First of three linked employee records: the back
 * arrow is disabled (null route), the forward arrow points to record 2. Open {@code /peer-nav-demo}
 * and step through with the header arrows.
 */
@UI("/peer-nav-demo")
@Title("Ada Lovelace")
@PlainText
public class EmployeeRecord1 implements PeerNavigationSupplier {

  String name = "Ada Lovelace";
  String position = "Employee #100";
  String record = "1 of 3";

  @Override
  public PeerNav peers(HttpRequest httpRequest) {
    return new PeerNav(null, null, "Alan Turing", "/peer-nav-demo/2");
  }
}
