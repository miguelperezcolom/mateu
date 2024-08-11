package io.mateu.dtos;

import java.util.Map;
import lombok.*;

public record Component(ViewMetadata metadata, String id, Map<String, Object> attributes) {}
