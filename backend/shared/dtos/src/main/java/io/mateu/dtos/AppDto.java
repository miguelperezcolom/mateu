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
    boolean chromeless,
    /**
     * The app's REST source catalogue: every named endpoint its screens reference, declared once.
     * App-wide configuration, so it travels with the shell rather than on every response.
     */
    List<RestSourceEntryDto> restSources,
    /**
     * The app's APP-SCOPE data source: a reference the shell fetches ONCE on boot into the app-data
     * store, shared across routes. Declared by a mount's root route {@code appData} in routes.yaml.
     */
    RestDataSourceDto appDataSource,
    /**
     * The capability tokens this app REQUIRES from whatever renderer/shell hosts it (see {@code
     * io.mateu.uidl.Capabilities}). A host compares them against what its renderer PROVIDES and
     * reports what is missing instead of rendering a broken screen — compatibility by capability,
     * not by version. Mostly derived from the app's own metadata, plus any {@code @App(requires)}.
     */
    List<String> requiredCapabilities)
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
    restSources = Collections.unmodifiableList(restSources != null ? restSources : List.of());
    requiredCapabilities =
        Collections.unmodifiableList(
            requiredCapabilities != null ? requiredCapabilities : List.of());
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

  public List<String> requiredCapabilities() {
    return Collections.unmodifiableList(
        requiredCapabilities != null ? requiredCapabilities : List.of());
  }
}
