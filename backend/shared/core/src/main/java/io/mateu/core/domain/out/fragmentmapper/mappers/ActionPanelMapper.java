package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ActionPanelCategoryDto;
import io.mateu.dtos.ActionPanelDto;
import io.mateu.dtos.ActionPanelItemDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.ActionPanel;
import io.mateu.uidl.data.ActionPanelCategory;
import io.mateu.uidl.data.ActionPanelItem;
import java.util.List;

public class ActionPanelMapper {

  public static ClientSideComponentDto mapActionPanelToDto(ActionPanel panel) {
    return new ClientSideComponentDto(
        ActionPanelDto.builder()
            .label(panel.label() != null && !panel.label().isBlank() ? panel.label() : "I want to…")
            .shortcut(panel.shortcut())
            .categories(
                panel.categories() == null
                    ? List.of()
                    : panel.categories().stream().map(ActionPanelMapper::category).toList())
            .maxPerCategory(panel.maxPerCategory() > 0 ? panel.maxPerCategory() : 10)
            .hideUnpopulatedToggle(panel.hideUnpopulatedToggle())
            .build(),
        panel.id(),
        List.of(),
        panel.style(),
        panel.cssClasses(),
        null);
  }

  private static ActionPanelCategoryDto category(ActionPanelCategory category) {
    return new ActionPanelCategoryDto(
        category.title(),
        category.actions() == null
            ? List.of()
            : category.actions().stream().map(ActionPanelMapper::item).toList());
  }

  private static ActionPanelItemDto item(ActionPanelItem item) {
    return new ActionPanelItemDto(
        item.label(),
        item.actionId(),
        item.parameters(),
        item.count(),
        item.populated() || (item.count() != null && item.count() > 0),
        item.disabled());
  }
}
