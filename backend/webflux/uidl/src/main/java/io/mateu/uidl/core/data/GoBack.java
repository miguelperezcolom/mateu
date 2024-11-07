package io.mateu.uidl.core.data;

public record GoBack<T>(ResultType resultType, String message, T data) {}
