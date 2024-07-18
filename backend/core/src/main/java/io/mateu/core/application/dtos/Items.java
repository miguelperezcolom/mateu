package io.mateu.core.application.dtos;

import io.mateu.core.domain.uidefinition.shared.data.Value;
import java.util.List;

public record Items(List<Value> content, long totalElements) {}
