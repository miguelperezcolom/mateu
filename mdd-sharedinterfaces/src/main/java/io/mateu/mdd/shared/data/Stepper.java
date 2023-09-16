package io.mateu.mdd.shared.data;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Stepper {

  double value;

  String text;

  List<StepperStep> steps;
}
