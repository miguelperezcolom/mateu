package io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.delete;

import java.util.List;

public record DeleteValueObjectCommand(List<String> ids) {
}
