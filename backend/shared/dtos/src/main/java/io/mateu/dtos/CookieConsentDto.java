package io.mateu.dtos;

import lombok.Builder;

/** Metadata for a html element */
@Builder
public record CookieConsentDto(
    CookieConsentPositionDto position,
    String cookieName,
    String message,
    String theme,
    String learnMore,
    String learnMoreLink,
    String dismiss)
    implements ComponentMetadataDto {}
