package io.mateu.core.application;

import io.mateu.core.domain.uidefinition.shared.data.Value;
import java.util.List;

public record Items(List<Value> content, long totalElements) {}
