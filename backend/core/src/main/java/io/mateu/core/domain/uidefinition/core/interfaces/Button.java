package io.mateu.core.domain.uidefinition.core.interfaces;

import java.util.concurrent.Callable;

public record Button(String caption, Callable callable) {}
