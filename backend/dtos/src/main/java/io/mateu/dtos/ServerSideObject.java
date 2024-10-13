package io.mateu.dtos;

import java.util.Map;

public record ServerSideObject(
        String className,
        Map<String, Object> data
) {
}
