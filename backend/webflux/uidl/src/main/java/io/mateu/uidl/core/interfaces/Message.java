package io.mateu.uidl.core.interfaces;

import io.mateu.uidl.core.data.ResultType;

public record Message(
    ResultType type, String title, String text, int duration // 0 for no limit. In milliseconds
    ) {}
