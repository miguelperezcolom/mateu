package io.mateu.mdd.demofrontoffice.domain.stay;

import org.springframework.data.relational.core.mapping.Table;

/** Reference to an add-on catalog item contracted for the stay. */
@Table("stay_add_on")
public record SelectedAddOn(String addOnId) {}
