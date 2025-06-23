package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.CookieConsentDto;
import io.mateu.uidl.data.CookieConsent;
import java.util.List;

public class CookieConsentComponentToDtoMapper {

  public static ComponentDto mapCookieConsentToDto(CookieConsent cookieConsent) {
    return new ComponentDto(new CookieConsentDto(), "fieldId", null, List.of());
  }
}
