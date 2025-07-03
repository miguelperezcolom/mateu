package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.CookieConsentDto;
import io.mateu.uidl.data.CookieConsent;
import java.util.List;

public class CookieConsentComponentToDtoMapper {

  public static ClientSideComponentDto mapCookieConsentToDto(CookieConsent cookieConsent) {
    return new ClientSideComponentDto(new CookieConsentDto(), "fieldId", List.of(), "", "");
  }
}
