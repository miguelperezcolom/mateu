package io.mateu.mdd.specdrivengenerator.application.usecases.invariant.delete;

import java.util.List;

public record DeleteInvariantCommand(List<String> ids) {
}
