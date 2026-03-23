package io.mateu.mdd.specdrivengenerator.application.query.dtos;

import io.mateu.uidl.annotations.Hidden;

public record ProjectRow(@Hidden String id, String name, String outputPath, String packageName) {
}
