package io.mateu.mdd.demofrontoffice.domain.stay;

import org.springframework.data.relational.core.mapping.Table;

/** A person accompanying the stay's main guest. Value object owned by {@link Stay}. */
@Table("stay_companion")
public record Companion(String companionId, String name, String description) {}
