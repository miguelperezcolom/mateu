package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A placeholder for a component that is resolved asynchronously on the server. */
@Builder
public record FutureComponent(Object instance) implements Component {}
