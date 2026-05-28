package io.mateu.core.domain.out.fragmentmapper;

import static io.mateu.core.domain.out.fragmentmapper.mappers.AccordionLayoutMapper.mapAccordionLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AccordionPanelMapper.mapAccordionPanelToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AnchorMapper.mapAnchorToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AppMapper.mapAppToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AvatarGroupMapper.mapAvatarGroupToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.AvatarMapper.mapAvatarToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BadgeMapper.mapBadgeToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BoardLayoutItemMapper.mapBoardLayoutItemToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BoardLayoutMapper.mapBoardLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BoardLayoutRowMapper.mapBoardLayoutRowToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BpmnMapper.mapBpmnToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.BreadcrumbsMapper.mapBreadcrumbsToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ButtonMapper.mapButtonToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CardMapper.mapCardToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CarouselLayoutMapper.mapCarouselLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ChartMapper.mapChartToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ChatMapper.mapChatToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ComponentTreeSupplierMapper.mapComponentTreeSupplierToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ConfirmDialogMapper.mapConfirmDialogToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ContainerMapper.mapContainerToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ContextMenuMapper.mapContextMenuToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CookieConsentMapper.mapCookieConsentToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CrudlMapper.mapCrudlToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.CustomFieldMapper.mapCustomFieldToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DetailsMapper.mapDetailsToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DialogMapper.mapDialogToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DirectoryMapper.mapDirectoryToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.DivMapper.mapDivToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ElementMapper.mapElementToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FieldMapper.mapFormFieldToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormEditorMapper.mapFormEditorToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormItemMapper.mapFormItemToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormLayoutMapper.mapFormLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormMapper.mapFormToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormRowMapper.mapFormRowToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormSectionMapper.mapFormSectionToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FormSubSectionMapper.mapFormSubSectionToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FullWidthMapper.mapFullWidthToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.FutureComponentMapper.mapFutureComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.GridColumnMapper.mapGridColumnToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.GridGroupColumnMapper.mapGridGroupColumnToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.GridMapper.mapGridToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.HorizontalLayoutMapper.mapHorizontalLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.IconMapper.mapIconToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ImageMapper.mapImageToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.KPIMapper.mapKPIToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MapComponentMapper.mapMapToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MarkdownMapper.mapMarkdownToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MasterDetailLayoutMapper.mapMasterDetailLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MenuBarMapper.mapMenuBarToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MessageInputMapper.mapMessageInputToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MessageListMapper.mapMessageListToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.MicroFrontendMapper.mapMicroFrontendToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.NotificationMapper.mapNotificationToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.PageMapper.mapPageToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.PopoverMapper.mapPopoverToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ProgressBarMapper.mapProgressBarToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ScrollerMapper.mapScrollerToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.SplitLayoutMapper.mapSplitLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TabLayoutMapper.mapTabLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TabMapper.mapTabToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TextMapper.mapTextToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.TooltipMapper.mapTooltipToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.VerticalLayoutMapper.mapVerticalLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.VirtualListMapper.mapVirtualListToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.WorkflowElkMapper.mapWorkflowElkToDto;
import static io.mateu.core.domain.out.fragmentmapper.mappers.WorkflowMapper.mapWorkflowToDto;

import io.mateu.dtos.*;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.DtoSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public final class ComponentToFragmentDtoMapper {

  public static ComponentDto mapComponentToDto(
      ComponentTreeSupplier componentSupplier,
      Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component == null && componentSupplier != null) {
      if (componentSupplier instanceof DtoSupplier dtoSupplier) {
        return dtoSupplier.dto(httpRequest);
      }
      return mapComponentTreeSupplierToDto(
          componentSupplier, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component == null) {
      return null;
    }
    if (component instanceof FutureComponent futureComponent) {
      return mapFutureComponentToDto(
          futureComponent, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof ComponentTreeSupplier componentTreeSupplier) {
      if (componentSupplier instanceof DtoSupplier dtoSupplier) {
        return dtoSupplier.dto(httpRequest);
      }
      return mapComponentTreeSupplierToDto(
          componentTreeSupplier, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof PageView page) {
      return mapPageToDto(
          page,
          componentSupplier,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    if (component instanceof AppShell app) {
      return mapAppToDto(
          componentSupplier, app, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Form form) {
      return mapFormToDto(
          form,
          componentSupplier,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    if (component instanceof Listing crudl) {
      return mapCrudlToDto(
          crudl,
          componentSupplier,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    if (component instanceof HorizontalLayout horizontalLayout) {
      return mapHorizontalLayoutToDto(
          horizontalLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof VerticalLayout verticalLayout) {
      return mapVerticalLayoutToDto(
          verticalLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormLayout formLayout) {
      return mapFormLayoutToDto(
          formLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormRow formRow) {
      return mapFormRowToDto(
          formRow, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormItem formItem) {
      return mapFormItemToDto(
          formItem, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof SplitLayout splitLayout) {
      return mapSplitLayoutToDto(
          splitLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof MasterDetailLayout masterDetailLayout) {
      return mapMasterDetailLayoutToDto(
          masterDetailLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof CarouselLayout carouselLayout) {
      return mapCarouselLayoutToDto(
          carouselLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof AccordionLayout accordionLayout) {
      return mapAccordionLayoutToDto(
          accordionLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof AccordionPanel accordionPanel) {
      return mapAccordionPanelToDto(
          accordionPanel, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof TabLayout tabLayout) {
      return mapTabLayoutToDto(
          tabLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Tab tab) {
      return mapTabToDto(tab, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Breadcrumbs breadcrumbs) {
      return mapBreadcrumbsToDto(breadcrumbs);
    }
    if (component instanceof BoardLayout boardLayout) {
      return mapBoardLayoutToDto(
          boardLayout, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof BoardLayoutRow boardLayoutRow) {
      return mapBoardLayoutRowToDto(
          boardLayoutRow, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof BoardLayoutItem boardLayoutItem) {
      return mapBoardLayoutItemToDto(
          boardLayoutItem, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Scroller scroller) {
      return mapScrollerToDto(
          scroller, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FullWidth fullWidth) {
      return mapFullWidthToDto(
          fullWidth, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Container container) {
      return mapContainerToDto(
          container, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Element element) {
      return mapElementToDto(element);
    }
    if (component instanceof Text text) {
      return mapTextToDto(text);
    }
    if (component instanceof FormField formField) {
      return mapFormFieldToDto(
          formField, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Chat chat) {
      return mapChatToDto(chat);
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
    if (component instanceof KPI kpi) {
      return mapKPIToDto(kpi);
    }
    if (component instanceof Anchor anchor) {
      return mapAnchorToDto(anchor);
    }
    if (component instanceof Button button) {
      return mapButtonToDto(button);
    }
    if (component instanceof Card card) {
      return mapCardToDto(card, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Bpmn bpmn) {
      return mapBpmnToDto(bpmn);
    }
    if (component instanceof io.mateu.uidl.data.Workflow workflow) {
      return mapWorkflowToDto(workflow);
    }
    if (component instanceof io.mateu.uidl.data.WorkflowElk workflowElk) {
      return mapWorkflowElkToDto(workflowElk);
    }
    if (component instanceof io.mateu.uidl.data.FormEditor formEditor) {
      return mapFormEditorToDto(formEditor);
    }
    if (component instanceof Chart chart) {
      return mapChartToDto(chart);
    }
    if (component instanceof Icon icon) {
      return mapIconToDto(icon);
    }
    if (component instanceof ConfirmDialog confirmDialog) {
      return mapConfirmDialogToDto(
          confirmDialog, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof ContextMenu contextMenu) {
      return mapContextMenuToDto(
          contextMenu, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof CookieConsent cookieConsent) {
      return mapCookieConsentToDto(cookieConsent);
    }
    if (component instanceof Details details) {
      return mapDetailsToDto(
          details, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Dialog dialog) {
      return mapDialogToDto(
          dialog, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
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
      return mapPopoverToDto(
          popover, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Div div) {
      return mapDivToDto(div, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormSection formSection) {
      return mapFormSectionToDto(
          formSection, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof FormSubSection formSubSection) {
      return mapFormSubSectionToDto(
          formSubSection, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Tooltip tooltip) {
      return mapTooltipToDto(
          tooltip, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof MessageInput messageInput) {
      return mapMessageInputToDto(messageInput);
    }
    if (component instanceof MessageList messageList) {
      return mapMessageListToDto(messageList);
    }
    if (component instanceof CustomField customField) {
      return mapCustomFieldToDto(
          customField, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof MenuBar menuBar) {
      return mapMenuBarToDto(
          menuBar, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Grid grid) {
      return mapGridToDto(grid, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof GridColumn gridColumn) {
      return mapGridColumnToDto(gridColumn, baseUrl, route, httpRequest);
    }
    if (component instanceof GridGroupColumn gridGroupColumn) {
      return mapGridGroupColumnToDto(gridGroupColumn, baseUrl, route, httpRequest);
    }
    if (component instanceof Directory directory) {
      return mapDirectoryToDto(
          directory, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof VirtualList virtualList) {
      return mapVirtualListToDto(
          virtualList, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    return new ClientSideComponentDto(
        new ElementDto("div", Map.of(), Map.of(), component.toString()),
        UUID.randomUUID().toString(),
        List.of(),
        component.style(),
        component.cssClasses(),
        null);
  }
}
