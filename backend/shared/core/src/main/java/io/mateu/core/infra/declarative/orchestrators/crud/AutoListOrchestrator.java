package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.uidl.interfaces.Identifiable;

public abstract class AutoListOrchestrator<T extends Identifiable>
    extends FilteredAutoListOrchestrator<T, T> {}
