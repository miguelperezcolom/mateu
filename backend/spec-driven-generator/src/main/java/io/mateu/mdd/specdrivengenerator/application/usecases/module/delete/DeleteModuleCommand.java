package io.mateu.mdd.specdrivengenerator.application.usecases.module.delete;

import java.util.List;

public record DeleteModuleCommand(List<String> ids) {
}
