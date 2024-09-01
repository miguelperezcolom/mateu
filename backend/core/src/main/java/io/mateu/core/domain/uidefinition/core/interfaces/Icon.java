package io.mateu.core.domain.uidefinition.core.interfaces;

import java.util.concurrent.Callable;

public record Icon(String icon, String description, Callable callable) {}
