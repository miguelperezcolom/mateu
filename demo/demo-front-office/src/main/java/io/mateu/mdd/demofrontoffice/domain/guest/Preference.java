package io.mateu.mdd.demofrontoffice.domain.guest;

import org.springframework.data.relational.core.mapping.Table;

/** A stated preference of the guest ("High floor", "Quiet room", …). Value object. */
@Table("guest_preference")
public record Preference(String text) {}
