package io.mateu.core.infra.declarative.orchestrators.crud;

import io.mateu.uidl.interfaces.Identifiable;

public abstract class AutoCrud<T extends Identifiable>
    extends FilteredAutoCrud<T, T> {}
