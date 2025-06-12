package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record AccordionPanel(String label, Component content) implements Component {}
