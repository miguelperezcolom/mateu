package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.CookieConsentDto;
import io.mateu.dtos.CookieConsentPositionDto;
import io.mateu.uidl.data.CookieConsent;
import java.util.List;

public class CookieConsentComponentToDtoMapper {

  public static ClientSideComponentDto mapCookieConsentToDto(CookieConsent cookieConsent) {
    return new ClientSideComponentDto(
        CookieConsentDto.builder()
            .cookieName(cookieConsent.cookieName())
            .dismiss(cookieConsent.dismiss())
            .learnMore(cookieConsent.learnMore())
            .learnMoreLink(cookieConsent.learnMoreLink())
            .message(cookieConsent.message())
            .position(
                cookieConsent.position() != null
                    ? CookieConsentPositionDto.valueOf(cookieConsent.position().name())
                    : null)
            .theme(cookieConsent.theme())
            .build(),
        "fieldId",
        List.of(),
        cookieConsent.style(),
        cookieConsent.cssClasses(),
        null);
  }
}
