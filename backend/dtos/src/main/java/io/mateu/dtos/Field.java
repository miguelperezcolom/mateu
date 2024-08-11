package io.mateu.dtos;

import java.util.List;

public record Field(
        String id,
        String type,
        String stereotype,
        boolean observed,
        String caption,
        String placeholder,
        String cssClasses,
        String description,
        List<Badge> badges,
        List<Validation> validations,
        List<Pair> attributes
) { }
