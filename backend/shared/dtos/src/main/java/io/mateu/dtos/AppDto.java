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
    boolean accessKeys,
    /** {@code @NoBreadcrumbs} on the shell: no automatic breadcrumb trail on any of its pages. */
    boolean noBreadcrumbs,
    /**
     * The label of the shell's own "ask" FAB ({@code @App(askLabel)}); blank = the renderer's own
     * (Redwood: "Ask Oracle").
     */
    String askLabel,
    /**
     * The icon of the shell's own "ask" FAB ({@code @App(askIcon)}): an initial, an image path/url
     * or an icon name; blank = the renderer's own (Redwood: the Oracle "O").
     */
    String askIcon,
    /**
     * The app's brand accent ({@code @App(accentColor)}), a CSS colour; null = no accent. Not the
     * primary colour: the shell draws it on the console name, the welcome hero and the accent
     * strip.
     */
    String accentColor,
    /**
     * The accent strip's image ({@code @App(accentStrip)}), a URL repeated along the strip; null =
     * none declared ({@code "none"} also travels as null).
     */
    String accentStrip,
    /**
     * The strip Mateu draws from the accent colour when the app declares no {@code accentStrip}: a
     * {@code data:image/svg+xml;base64,…} URI (see {@code io.mateu.core.infra.AccentStrip}). Read
     * by the Vaadin renderer only — Redwood shows its own Spectra strips. Null when the app
     * declares a strip, says {@code "none"}, has no accent or a non-hex one.
     */
    String generatedAccentStrip,
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
    List<String> requiredCapabilities,
    /**
     * The app's business-component catalogue (coherence-plan #13): every named composition its
     * screens reference by {@code ComponentRef}, already mapped to the wire. App-wide, so it
     * travels with the shell — and it is what lets a reference resolve with no backend (the
     * client-side expander looks a name up here). Empty for an app that declares none.
     */
    List<ComponentEntryDto> components,
    /**
     * {@code @App(backLink = PARENT)}: the route of the "← Parent" link (the nearest route above
     * the app's own that answers a screen). Null when the app keeps its breadcrumbs.
     */
    String backRoute,
    /** The label of the "← Parent" link: the parent screen's title. */
    String backLabel)
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
    components = Collections.unmodifiableList(components != null ? components : List.of());
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
