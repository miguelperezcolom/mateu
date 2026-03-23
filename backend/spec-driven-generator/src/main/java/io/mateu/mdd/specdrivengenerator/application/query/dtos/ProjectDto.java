package io.mateu.mdd.specdrivengenerator.application.query.dtos;

import java.util.List;

public record ProjectDto(String id, String name, List<String> moduleIds) {
}
