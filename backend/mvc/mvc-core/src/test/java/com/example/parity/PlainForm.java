package com.example.parity;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** A plain UI, resolved through the generated route resolver (no handler interfaces). */
@UI("/plain")
@Title("Plain form")
public class PlainForm {

  public String name = "Ada";
}
