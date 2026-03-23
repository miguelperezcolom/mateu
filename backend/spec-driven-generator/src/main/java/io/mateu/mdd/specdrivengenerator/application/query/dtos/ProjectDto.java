package io.mateu.mdd.specdrivengenerator.application.query.dtos;

import java.util.List;

public record ProjectDto(String id, String name, String outputPath, String packageName, List<String> moduleIds) {
}
