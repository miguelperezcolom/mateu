package io.mateu.mdd.specdrivengenerator.infra.out.persistence.file;

import io.mateu.uidl.interfaces.Identifiable;

import java.util.List;

public record ProjectEntity(
        String id,
        String name,
        List<ModuleEntity> modules
) implements Identifiable {
}
