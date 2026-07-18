package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.out.fragmentmapper.ComponentToFragmentDtoMapper.mapComponentToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.FoldoutLayoutDto;
import io.mateu.dtos.FoldoutPanelInfoDto;
import io.mateu.uidl.data.FoldoutLayout;
import io.mateu.uidl.data.FoldoutPanel;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

public class FoldoutLayoutMapper {

  public static ClientSideComponentDto mapFoldoutLayoutToDto(
      FoldoutLayout foldoutLayout,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    List<ComponentDto> children = new ArrayList<>();
    if (foldoutLayout.overview() != null) {
      children.add(
          mapComponentToDto(
                  null,
                  foldoutLayout.overview(),
                  baseUrl,
                  route,
                  consumedRoute,
                  initiatorComponentId,
                  httpRequest)
              .setSlot("overview"));
    }
    List<FoldoutPanelInfoDto> panelInfos = new ArrayList<>();
    List<FoldoutPanel> panels = foldoutLayout.panels() != null ? foldoutLayout.panels() : List.of();
    for (int i = 0; i < panels.size(); i++) {
      FoldoutPanel panel = panels.get(i);
      panelInfos.add(
          FoldoutPanelInfoDto.builder()
              .title(panel.title())
              .subtitle(panel.subtitle())
              .icon(panel.icon())
              .open(panel.open())
              .build());
      if (panel.content() != null) {
        children.add(
            mapComponentToDto(
                    null,
                    panel.content(),
                    baseUrl,
                    route,
                    consumedRoute,
                    initiatorComponentId,
                    httpRequest)
                .setSlot("panel-" + i));
      }
    }
    List<String> badgeTexts = new ArrayList<>();
    if (foldoutLayout.badges() != null) {
      for (io.mateu.uidl.data.Badge badge : foldoutLayout.badges()) {
        if (badge != null && badge.text() != null && !badge.text().isBlank()) {
          badgeTexts.add(badge.text());
        }
      }
    }
    return new ClientSideComponentDto(
        FoldoutLayoutDto.builder()
            .panels(panelInfos)
            .headerTitle(foldoutLayout.headerTitle())
            .badges(badgeTexts)
            .build(),
        foldoutLayout.id(),
        children,
        foldoutLayout.style(),
        foldoutLayout.cssClasses(),
        null);
  }
}
