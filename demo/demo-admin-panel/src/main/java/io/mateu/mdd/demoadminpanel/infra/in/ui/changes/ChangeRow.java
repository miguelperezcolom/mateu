package io.mateu.mdd.demoadminpanel.infra.in.ui.changes;

import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.interfaces.Identifiable;

public record ChangeRow(@Hidden String id, String page, String country, String language, Status status, ColumnAction action) implements Identifiable {
}
