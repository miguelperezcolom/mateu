package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record CookieConsent(
    String style,
    String cssClasses,
    CookieConsentPosition position,
    String cookieName,
    String message,
    String theme,
    String learnMore,
    String learnMoreLink, // https://www.cookiesandyou.com/
    String dismiss)
    implements Component {}
