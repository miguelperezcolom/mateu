package io.mateu.core.domain.uidefinition.shared.data;

public record StepperStep(
    String id, String caption, String description, boolean done, boolean current) {}
