package io.mateu.mdd.specdrivengenerator.application.usecases.entity.delete;

import java.util.List;

public record DeleteEntityCommand(List<String> ids) {
}
