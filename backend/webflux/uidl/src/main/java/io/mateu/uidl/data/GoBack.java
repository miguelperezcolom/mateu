package io.mateu.uidl.data;

public record GoBack<T>(ResultType resultType, String message, T data) {}
