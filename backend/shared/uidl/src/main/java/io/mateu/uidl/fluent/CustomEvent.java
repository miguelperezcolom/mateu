package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record CustomEvent(String eventName, Object detail) {}
