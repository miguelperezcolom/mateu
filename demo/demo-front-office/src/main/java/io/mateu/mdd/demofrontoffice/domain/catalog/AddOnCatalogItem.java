package io.mateu.mdd.demofrontoffice.domain.catalog;

import java.math.BigDecimal;
import org.springframework.data.annotation.Id;

/**
 * An add-on offered during check-in (packages, transfer, late check-out…). Reference data;
 * {@code includedLabel} marks items included for certain tiers ("Incluido Platinum") instead of
 * carrying a price.
 */
public record AddOnCatalogItem(
    @Id String id,
    String icon,
    String title,
    String description,
    BigDecimal price,
    String unit,
    String includedLabel) {}
