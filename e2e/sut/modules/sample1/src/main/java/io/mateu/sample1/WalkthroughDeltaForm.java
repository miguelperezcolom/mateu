package io.mateu.sample1;

import io.mateu.uidl.annotations.FormLayout;

/**
 * The view model of {@code /walkthrough/delta}: its form is INFERRED from these fields, and the
 * route's definition (specs/ui/walkthrough/delta.yaml) only records what a human changed — note first
 * (across the form's rows), extra hidden, count relabelled.
 *
 * <p>Two columns DECLARED: with four fields Mateu would infer one (up to six → one column), and the
 * delta's point is moving a field across the rows of a multi-column form.
 */
@FormLayout(columns = 2)
public class WalkthroughDeltaForm {

  public int count = 7;

  public String secret = "first";

  public String note = "";

  public String extra = "hidden";
}
