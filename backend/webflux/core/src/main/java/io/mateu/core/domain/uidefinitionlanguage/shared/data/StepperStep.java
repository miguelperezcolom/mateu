package io.mateu.core.domain.uidefinitionlanguage.shared.data;

public record StepperStep(
    String id, String caption, String description, boolean done, boolean current) {}
