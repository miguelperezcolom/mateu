package io.mateu.mdd.specdrivengenerator.application.usecases.project.generatecode;

public record GenerateCodeCommand(String projectId, String outputPath, String packageName, boolean sourceOnly) {
}
