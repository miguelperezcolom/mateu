package io.mateu.core.application;

public record ResolvedRoute(String route, String pattern, Class<?> resolvedClass) {}
