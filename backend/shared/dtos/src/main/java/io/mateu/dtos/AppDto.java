package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record AppDto(
    String icon,
    String logo,
    String title,
    String subtitle,
    List<MenuDto> menu,
    String homeJourneyTypeId,
    String loginUrl,
    String welcomeMessage,
    String logoutUrl,
    List<AppDescriptorDto> apps) {

  public AppDto {
    menu = Collections.unmodifiableList(menu != null ? menu : List.of());
    apps = Collections.unmodifiableList(apps != null ? apps : List.of());
  }

  @Override
  public List<MenuDto> menu() {
    return Collections.unmodifiableList(menu);
  }

  @Override
  public List<AppDescriptorDto> apps() {
    return Collections.unmodifiableList(apps);
  }
}
