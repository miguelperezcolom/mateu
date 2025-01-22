package io.mateu.uidl.data;

import java.util.Collections;
import java.util.List;

public record Stepper(double value, String text, List<StepperStep> steps) {

  public Stepper {
    steps = Collections.unmodifiableList(steps);
  }

  @Override
  public List<StepperStep> steps() {
    return Collections.unmodifiableList(steps);
  }
}
