package io.mateu.mdd.demoadminpanel.infra.in.ui.changes;

public record ChangeDto(String pageId, String page, String country, String language, ChangeStatus status) {
}
