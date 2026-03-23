package io.mateu.mdd.specdrivengenerator.application.usecases.project.delete;

import java.util.List;

public record DeleteProjectCommand(List<String> ids) {
}
