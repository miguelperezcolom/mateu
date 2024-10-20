package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.dtos.ResultType;

public record Message(
    ResultType type, String title, String text, int duration // 0 for no limit. In milliseconds
    ) {}
