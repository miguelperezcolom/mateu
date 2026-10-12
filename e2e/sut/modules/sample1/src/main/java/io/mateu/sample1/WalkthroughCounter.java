package io.mateu.sample1;

/**
 * The view model of {@code /walkthrough/bound}: NOT a {@code @UI} class — bound to the route only by
 * its routes.yaml entry, which also names the layout (specs/ui/walkthrough/bound.yaml). The state
 * and the behaviour are the class's; the screen is data.
 */
public class WalkthroughCounter {

  public int count = 1;

  public void increment() {
    count++;
  }
}
