package io.mateu.dtos;

import lombok.Builder;

/**
 * Metadata for a tab layout. Child componentIds are in the TabLayout component itself.
 *
 * <p>{@code groupRelationship} carries the semantic relationship between the tabbed groups; {@code
 * adaptable} tells renderers they may swap the concrete widget (e.g. degrade tabs to an accordion
 * on narrow viewports) as long as the disclosure semantics are preserved.
 */
@Builder
public record TabLayoutDto(
    OrientationDto orientation,
    TabLayoutVariantDto variant,
    GroupRelationshipDto groupRelationship,
    boolean adaptable)
    implements ComponentMetadataDto {}
