package io.mateu.uidl.core.data;

public record StepperStep(
    String id, String caption, String description, boolean done, boolean current) {}
