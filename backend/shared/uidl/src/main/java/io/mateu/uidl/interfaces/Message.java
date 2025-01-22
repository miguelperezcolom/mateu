package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.ResultType;

public record Message(
    ResultType type, String title, String text, int duration // 0 for no limit. In milliseconds
    ) {}
