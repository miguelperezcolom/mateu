package io.mateu.mdd.specdrivengenerator.infra.out.persistence.file;

import io.mateu.uidl.interfaces.Identifiable;

import java.util.List;

public record ProjectEntity(
        String id,
        String name,
        String outputPath,
        String packageName,
        List<String> moduleIds
) implements Identifiable {

    public ProjectEntity {
        if (moduleIds == null) moduleIds = List.of();
    }
}
