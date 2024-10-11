package io.mateu.core.domain.uidefinition.core.interfaces;

import java.util.concurrent.Callable;

public record CallableIcon(Icon icon, String description, Callable callable) {}
