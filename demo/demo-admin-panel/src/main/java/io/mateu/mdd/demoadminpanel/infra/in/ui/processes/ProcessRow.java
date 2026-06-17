package io.mateu.mdd.demoadminpanel.infra.in.ui.processes;

import io.mateu.uidl.interfaces.Identifiable;

public record ProcessRow(String id, String name) implements Identifiable {
}
