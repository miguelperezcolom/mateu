package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record AppDto(
    String route,
    AppVariantDto variant,
    String icon,
    String logo,
    String title,
    String subtitle,
    List<MenuOptionDto> menu,
    int totalMenuOptions,
    String homeRoute,
    String loginUrl,
    String welcomeMessage,
    String logoutUrl,
    List<AppDescriptorDto> apps,
    String style,
    String cssClasses)
    implements ComponentMetadataDto {

  public AppDto {
    variant = variant != null ? variant : AppVariantDto.TABS;
    menu = Collections.unmodifiableList(menu != null ? menu : List.of());
    apps = Collections.unmodifiableList(apps != null ? apps : List.of());
  }

  @Override
  public AppVariantDto variant() {
    return variant != null ? variant : AppVariantDto.TABS;
  }

  @Override
  public List<MenuOptionDto> menu() {
    return Collections.unmodifiableList(menu != null ? menu : List.of());
  }

  @Override
  public List<AppDescriptorDto> apps() {
    return Collections.unmodifiableList(apps != null ? apps : List.of());
  }
}
