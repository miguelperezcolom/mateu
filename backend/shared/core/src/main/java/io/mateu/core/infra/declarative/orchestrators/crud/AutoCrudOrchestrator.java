package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.uidl.interfaces.Identifiable;

public abstract class AutoCrudOrchestrator<T extends Identifiable>
    extends FilteredAutoCrudOrchestrator<T, T> {}
