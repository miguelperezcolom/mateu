package io.mateu.mdd.specdrivengenerator.infra.out.persistence.file;

import io.mateu.uidl.interfaces.Identifiable;

public record InvariantEntity(String id, String name) implements Identifiable {
}
