package io.mateu.sample1;

/**
 * The view model of {@code /walkthrough/delta}: its form is INFERRED from these fields, and the
 * route's definition (specs/ui/walkthrough/delta.yaml) only records what a human changed — secret
 * before count, extra hidden, count relabelled.
 */
public class WalkthroughDeltaForm {

  public int count = 7;

  public String secret = "first";

  public String note = "";

  public String extra = "hidden";
}
