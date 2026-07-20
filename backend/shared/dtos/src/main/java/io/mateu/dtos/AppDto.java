package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;
import lombok.With;

@Builder
@With
public record AppDto(
    String route,
    AppVariantDto variant,
    AppLayoutDto layout,
    String icon,
    String logo,
    String title,
    String subtitle,
    String favicon,
    List<MenuOptionDto> menu,
    int totalMenuOptions,
    String homeRoute,
    String homeConsumedRoute,
    String homeBaseUrl,
    String homeServerSideType,
    String homeUriPrefix,
    String serverSideType,
    String loginUrl,
    String welcomeMessage,
    String logoutUrl,
    List<AppDescriptorDto> apps,
    boolean drawerClosed,
    String style,
    String cssClasses,
    ComponentDto home,
    String rootRoute,
    String sseUrl,
    String mcpUrl,
    String uploadUrl,
    List<FabDto> fabs,
    boolean themeToggle,
    List<AppContextSelectorDto> contextSelectors,
    List<AppHeaderActionDto> contextActions,
    boolean notificationsEnabled,
    boolean globalSearchEnabled,
    boolean commandCenterEnabled,
    boolean chromeless)
    implements ComponentMetadataDto {

  public AppDto {
    variant = variant != null ? variant : AppVariantDto.TABS;
    layout = layout != null ? layout : AppLayoutDto.SINGLE_SLOT;
    menu = Collections.unmodifiableList(menu != null ? menu : List.of());
    apps = Collections.unmodifiableList(apps != null ? apps : List.of());
    contextSelectors =
        Collections.unmodifiableList(contextSelectors != null ? contextSelectors : List.of());
    contextActions =
        Collections.unmodifiableList(contextActions != null ? contextActions : List.of());
  }

  @Override
  public AppVariantDto variant() {
    return variant != null ? variant : AppVariantDto.TABS;
  }

  @Override
  public AppLayoutDto layout() {
    return layout != null ? layout : AppLayoutDto.SINGLE_SLOT;
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
