package io.mateu.sample1;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Amount;
import lombok.Getter;
import lombok.Setter;

/**
 * Fixture for numeric fields that are legitimately EMPTY.
 *
 * <p>A boxed numeric is nullable because the absence is meaningful: a duration left unset means
 * "inherit the default", which is not the same as zero. Every other fixture here uses primitives,
 * so an unset number never reached the browser and the field that renders it was never exercised
 * with nothing in it.
 */
@UI("/nullable-numbers")
@Title("Nullable numbers")
@Getter
@Setter
public class NullableNumbersForm {

  String name;

  Integer failuresBeforeSuccess;

  Long durationMs;

  int alwaysSet;

  /** Starts with a figure, so a test can clear it and see whether the clear is carried anywhere. */
  Amount price = new Amount("EUR", 25.5);
}
