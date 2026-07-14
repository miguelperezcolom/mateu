package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.OrgChartDto;
import io.mateu.dtos.OrgNodeDto;
import io.mateu.uidl.data.OrgChart;
import io.mateu.uidl.data.OrgNode;
import java.util.List;

public class OrgChartMapper {

  public static ClientSideComponentDto mapOrgChartToDto(OrgChart orgChart) {
    return new ClientSideComponentDto(
        OrgChartDto.builder().root(mapNode(orgChart.root())).build(),
        orgChart.id(),
        List.of(),
        orgChart.style(),
        orgChart.cssClasses(),
        null);
  }

  private static OrgNodeDto mapNode(OrgNode node) {
    if (node == null) {
      return null;
    }
    return OrgNodeDto.builder()
        .id(node.id())
        .title(node.title())
        .subtitle(node.subtitle())
        .avatar(node.avatar())
        .color(node.color())
        .actionId(node.actionId())
        .children(
            node.children() != null
                ? node.children().stream().map(OrgChartMapper::mapNode).toList()
                : List.of())
        .build();
  }
}
