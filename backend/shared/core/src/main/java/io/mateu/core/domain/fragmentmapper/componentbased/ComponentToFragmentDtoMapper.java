package io.mateu.core.domain.fragmentmapper.componentbased;

import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AccordionLayoutComponentToDtoMapper.mapAccordionLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AccordionPanelComponentToDtoMapper.mapAccordionPanelToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AnchorComponentToDtoMapper.mapAnchorToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AppComponentToDtoMapper.mapAppToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AvatarComponentToDtoMapper.mapAvatarToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.AvatarGroupComponentToDtoMapper.mapAvatarGroupToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.BadgeComponentToDtoMapper.mapBadgeToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.BoardLayoutComponentToDtoMapper.mapBoardLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.BoardLayoutRowComponentToDtoMapper.mapBoardLayoutRowToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ButtonComponentToDtoMapper.mapButtonToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.CardComponentToDtoMapper.mapCardToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ChartComponentToDtoMapper.mapChartToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapComponentTreeSupplierToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ConfirmDialogComponentToDtoMapper.mapConfirmDialogToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ContainerComponentToDtoMapper.mapContainerToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ContextMenuComponentToDtoMapper.mapContextMenuToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.CookieConsentComponentToDtoMapper.mapCookieConsentToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.CrudlComponentToDtoMapper.mapCrudlToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.CustomFieldComponentToDtoMapper.mapCustomFieldToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.DataComponentToDtoMapper.mapDataToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.DetailsComponentToDtoMapper.mapDetailsToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.DialogComponentToDtoMapper.mapDialogToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ElementComponentToDtoMapper.mapElementToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.FieldComponentToDtoMapper.mapFormFieldToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.FormComponentToDtoMapper.mapFormToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.FormLayoutComponentToDtoMapper.mapFormLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.FullWidthComponentToDtoMapper.mapFullWidthToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.GridComponentToDtoMapper.mapGridToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.HorizontalLayoutComponentToDtoMapper.mapHorizontalLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.IconComponentToDtoMapper.mapIconToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ImageComponentToDtoMapper.mapImageToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.MapComponentToDtoMapper.mapMapToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.MarkdownComponentToDtoMapper.mapMarkdownToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.MasterDetailLayoutComponentToDtoMapper.mapMasterDetailLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.MenuBarComponentToDtoMapper.mapMenuBarToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.MessageInputComponentToDtoMapper.mapMessageInputToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.MessageListComponentToDtoMapper.mapMessageListToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.MicroFrontendComponentToDtoMapper.mapMicroFrontendToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.NotificationComponentToDtoMapper.mapNotificationToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.PopoverComponentToDtoMapper.mapPopoverToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ProgressBarComponentToDtoMapper.mapProgressBarToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.ScrollerComponentToDtoMapper.mapScrollerToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.SplitLayoutComponentToDtoMapper.mapSplitLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.TabComponentToDtoMapper.mapTabToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.TabLayoutComponentToDtoMapper.mapTabLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.TextComponentToDtoMapper.mapTextToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.TooltipComponentToDtoMapper.mapTooltipToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.VerticalLayoutComponentToDtoMapper.mapVerticalLayoutToDto;
import static io.mateu.core.domain.fragmentmapper.componentbased.mappers.VirtualListComponentToDtoMapper.mapVirtualListToDto;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ElementDto;
import io.mateu.dtos.UIFragmentDto;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Anchor;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.AvatarGroup;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BoardLayout;
import io.mateu.uidl.data.BoardLayoutRow;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ConfirmDialog;
import io.mateu.uidl.data.Container;
import io.mateu.uidl.data.ContextMenu;
import io.mateu.uidl.data.CookieConsent;
import io.mateu.uidl.data.CustomField;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Details;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FullWidth;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Icon;
import io.mateu.uidl.data.Image;
import io.mateu.uidl.data.Markdown;
import io.mateu.uidl.data.MasterDetailLayout;
import io.mateu.uidl.data.MessageInput;
import io.mateu.uidl.data.MessageList;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.data.Notification;
import io.mateu.uidl.data.Popover;
import io.mateu.uidl.data.ProgressBar;
import io.mateu.uidl.data.Scroller;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.Tooltip;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.data.VirtualList;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Crudl;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.MenuBar;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public final class ComponentToFragmentDtoMapper {

  public static UIFragmentDto mapComponentToFragment(
      ComponentTreeSupplier componentSupplier,
      Component component,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component instanceof Data data) {
      return mapDataToDto(data, initiatorComponentId);
    }
    return new UIFragmentDto(
        initiatorComponentId,
        mapComponentToDto(componentSupplier, component, baseUrl, route, httpRequest),
        componentSupplier);
  }

  public static ComponentDto mapComponentToDto(
      ComponentTreeSupplier componentSupplier,
      Component component,
      String baseUrl,
      String route,
      HttpRequest httpRequest) {
    if (component == null && componentSupplier != null) {
      return mapComponentTreeSupplierToDto(componentSupplier, baseUrl, route, httpRequest);
    }
    if (component instanceof App app) {
      return mapAppToDto(componentSupplier, app, baseUrl, route, httpRequest);
    }
    if (component instanceof Form form) {
      return mapFormToDto(form, componentSupplier, baseUrl, route, httpRequest);
    }
    if (component instanceof Crudl crudl) {
      return mapCrudlToDto(crudl, componentSupplier, baseUrl, route, httpRequest);
    }
    if (component instanceof HorizontalLayout horizontalLayout) {
      return mapHorizontalLayoutToDto(horizontalLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof VerticalLayout verticalLayout) {
      return mapVerticalLayoutToDto(verticalLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof FormLayout formLayout) {
      return mapFormLayoutToDto(formLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof SplitLayout splitLayout) {
      return mapSplitLayoutToDto(splitLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof MasterDetailLayout masterDetailLayout) {
      return mapMasterDetailLayoutToDto(masterDetailLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof AccordionLayout accordionLayout) {
      return mapAccordionLayoutToDto(accordionLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof AccordionPanel accordionPanel) {
      return mapAccordionPanelToDto(accordionPanel, baseUrl, route, httpRequest);
    }
    if (component instanceof TabLayout tabLayout) {
      return mapTabLayoutToDto(tabLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof Tab tab) {
      return mapTabToDto(tab, baseUrl, route, httpRequest);
    }
    if (component instanceof BoardLayout boardLayout) {
      return mapBoardLayoutToDto(boardLayout, baseUrl, route, httpRequest);
    }
    if (component instanceof BoardLayoutRow boardLayoutRow) {
      return mapBoardLayoutRowToDto(boardLayoutRow, baseUrl, route, httpRequest);
    }
    if (component instanceof Scroller scroller) {
      return mapScrollerToDto(scroller, baseUrl, route, httpRequest);
    }
    if (component instanceof FullWidth fullWidth) {
      return mapFullWidthToDto(fullWidth, baseUrl, route, httpRequest);
    }
    if (component instanceof Container container) {
      return mapContainerToDto(container, baseUrl, route, httpRequest);
    }
    if (component instanceof Element element) {
      return mapElementToDto(element);
    }
    if (component instanceof Text text) {
      return mapTextToDto(text);
    }
    if (component instanceof FormField formField) {
      return mapFormFieldToDto(formField);
    }
    if (component instanceof Avatar avatar) {
      return mapAvatarToDto(avatar);
    }
    if (component instanceof AvatarGroup avatarGroup) {
      return mapAvatarGroupToDto(avatarGroup);
    }
    if (component instanceof Badge badge) {
      return mapBadgeToDto(badge);
    }
    if (component instanceof Anchor anchor) {
      return mapAnchorToDto(anchor);
    }
    if (component instanceof Button button) {
      return mapButtonToDto(button);
    }
    if (component instanceof Card card) {
      return mapCardToDto(card);
    }
    if (component instanceof Chart chart) {
      return mapChartToDto(chart);
    }
    if (component instanceof Icon icon) {
      return mapIconToDto(icon);
    }
    if (component instanceof ConfirmDialog confirmDialog) {
      return mapConfirmDialogToDto(confirmDialog);
    }
    if (component instanceof ContextMenu contextMenu) {
      return mapContextMenuToDto(contextMenu, baseUrl, route, httpRequest);
    }
    if (component instanceof CookieConsent cookieConsent) {
      return mapCookieConsentToDto(cookieConsent);
    }
    if (component instanceof Details details) {
      return mapDetailsToDto(details, baseUrl, route, httpRequest);
    }
    if (component instanceof Dialog dialog) {
      return mapDialogToDto(dialog, baseUrl, route, httpRequest);
    }
    if (component instanceof Image image) {
      return mapImageToDto(image);
    }
    if (component instanceof io.mateu.uidl.data.Map map) {
      return mapMapToDto(map);
    }
    if (component instanceof Markdown markdown) {
      return mapMarkdownToDto(markdown);
    }
    if (component instanceof MicroFrontend microFrontend) {
      return mapMicroFrontendToDto(microFrontend);
    }
    if (component instanceof Notification notification) {
      return mapNotificationToDto(notification);
    }
    if (component instanceof ProgressBar progressBar) {
      return mapProgressBarToDto(progressBar);
    }
    if (component instanceof Popover popover) {
      return mapPopoverToDto(popover, baseUrl, route, httpRequest);
    }
    if (component instanceof Tooltip tooltip) {
      return mapTooltipToDto(tooltip, baseUrl, route, httpRequest);
    }
    if (component instanceof MessageInput messageInput) {
      return mapMessageInputToDto(messageInput);
    }
    if (component instanceof MessageList messageList) {
      return mapMessageListToDto(messageList);
    }
    if (component instanceof CustomField customField) {
      return mapCustomFieldToDto(customField, baseUrl, route, httpRequest);
    }
    if (component instanceof MenuBar menuBar) {
      return mapMenuBarToDto(menuBar);
    }
    if (component instanceof Grid grid) {
      return mapGridToDto(grid);
    }
    if (component instanceof VirtualList virtualList) {
      return mapVirtualListToDto(virtualList);
    }
    return new ClientSideComponentDto(
        new ElementDto("div", Map.of(), component.toString()), "fieldId", List.of(), "", "");
  }
}
