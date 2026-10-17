package io.mateu.dtos;

/**
 * A stepper metadata. A stepper does not need metadata as it is built from the data.
 *
 * @deprecated nothing produces it: no Java mapper, no uidl record and neither port emits a {@code
 *     Stepper} component (a wizard's progress travels as {@code ProgressSteps} or {@code
 *     ProgressBar}). No replacement. It stays registered under {@code "Stepper"} only because the
 *     wire is additive within a major; it will be removed with the next wire major.
 */
@Deprecated(since = "3.0-alpha.426", forRemoval = true)
public record StepperDto() implements ComponentMetadataDto {}
