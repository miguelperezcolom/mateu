package io.mateu.mdd.demoadminpanel.infra.in.ui.changes;

public record ComparisonResult(String page, String maskedUrl, String transparentMaskedUrl, String diffUrl, double similarity) {
}
