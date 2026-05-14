package io.mateu.core.domain.out.fragmentmapper.componentbased;

import static io.mateu.core.application.runaction.RunActionUseCase.getState;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.AccordionLayoutComponentToDtoMapper.mapAccordionLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.AccordionPanelComponentToDtoMapper.mapAccordionPanelToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.AnchorComponentToDtoMapper.mapAnchorToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.AppComponentToDtoMapper.mapAppToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.AvatarComponentToDtoMapper.mapAvatarToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.AvatarGroupComponentToDtoMapper.mapAvatarGroupToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.BadgeComponentToDtoMapper.mapBadgeToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.BoardLayoutComponentToDtoMapper.mapBoardLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.BoardLayoutItemComponentToDtoMapper.mapBoardLayoutItemToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.BoardLayoutRowComponentToDtoMapper.mapBoardLayoutRowToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.BpmnComponentToDtoMapper.mapBpmnToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.BreadcrumbsComponentToDtoMapper.mapBreadcrumbsToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ButtonComponentToDtoMapper.mapButtonToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.CardComponentToDtoMapper.mapCardToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.CarouselLayoutComponentToDtoMapper.mapCarouselLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ChartComponentToDtoMapper.mapChartToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ChatComponentToDtoMapper.mapChatToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ComponentTreeSupplierToDtoMapper.mapComponentTreeSupplierToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ConfirmDialogComponentToDtoMapper.mapConfirmDialogToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ContainerComponentToDtoMapper.mapContainerToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ContextMenuComponentToDtoMapper.mapContextMenuToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.CookieConsentComponentToDtoMapper.mapCookieConsentToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.CrudlComponentToDtoMapper.mapCrudlToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.CustomFieldComponentToDtoMapper.mapCustomFieldToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.DataComponentToDtoMapper.mapDataToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.DetailsComponentToDtoMapper.mapDetailsToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.DialogComponentToDtoMapper.mapDialogToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.DirectoryComponentToDtoMapper.mapDirectoryToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.DivComponentToDtoMapper.mapDivToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ElementComponentToDtoMapper.mapElementToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FieldComponentToDtoMapper.mapFormFieldToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FormComponentToDtoMapper.mapFormToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FormEditorComponentToDtoMapper.mapFormEditorToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FormItemComponentToDtoMapper.mapFormItemToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FormLayoutComponentToDtoMapper.mapFormLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FormRowComponentToDtoMapper.mapFormRowToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FormSectionComponentToDtoMapper.mapFormSectionToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FormSubSectionComponentToDtoMapper.mapFormSubSectionToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FullWidthComponentToDtoMapper.mapFullWidthToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.FutureComponentToDtoMapper.mapFutureComponentToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.GridColumnComponentToDtoMapper.mapGridColumnToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.GridComponentToDtoMapper.mapGridToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.GridGroupColumnComponentToDtoMapper.mapGridGroupColumnToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.HorizontalLayoutComponentToDtoMapper.mapHorizontalLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.IconComponentToDtoMapper.mapIconToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ImageComponentToDtoMapper.mapImageToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.KPIComponentToDtoMapper.mapKPIToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.MapComponentToDtoMapper.mapMapToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.MarkdownComponentToDtoMapper.mapMarkdownToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.MasterDetailLayoutComponentToDtoMapper.mapMasterDetailLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.MenuBarComponentToDtoMapper.mapMenuBarToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.MessageInputComponentToDtoMapper.mapMessageInputToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.MessageListComponentToDtoMapper.mapMessageListToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.MicroFrontendComponentToDtoMapper.mapMicroFrontendToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.NotificationComponentToDtoMapper.mapNotificationToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.PageComponentToDtoMapper.mapPageToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.PopoverComponentToDtoMapper.mapPopoverToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ProgressBarComponentToDtoMapper.mapProgressBarToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ScrollerComponentToDtoMapper.mapScrollerToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.SplitLayoutComponentToDtoMapper.mapSplitLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.StateComponentToDtoMapper.mapStateToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.TabComponentToDtoMapper.mapTabToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.TabLayoutComponentToDtoMapper.mapTabLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.TextComponentToDtoMapper.mapTextToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.TooltipComponentToDtoMapper.mapTooltipToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.VerticalLayoutComponentToDtoMapper.mapVerticalLayoutToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.VirtualListComponentToDtoMapper.mapVirtualListToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.WorkflowComponentToDtoMapper.mapWorkflowToDto;
import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.WorkflowElkComponentToDtoMapper.mapWorkflowElkToDto;
import static io.mateu.core.infra.declarative.crudorchestrator.DataLayer.createData;

import io.mateu.dtos.*;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.*;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.DataSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public final class ComponentToFragmentDtoMapper {

  public static UIFragmentDto mapComponentToFragment(
      ComponentTreeSupplier componentSupplier,
      Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component instanceof State state) {
      return mapStateToDto(state, initiatorComponentId);
    }
    if (component instanceof Data data) {
      return mapDataToDto(data, initiatorComponentId, componentSupplier);
    }
    if (component != null && component.containerId() != null) {
      initiatorComponentId = component.containerId();
    }
    return new UIFragmentDto(
        initiatorComponentId,
        mapComponentToDto(
            componentSupplier,
            component,
            baseUrl,
            route,
            consumedRoute,
            initiatorComponentId,
            httpRequest),
        getState(componentSupplier, httpRequest),
        getData(httpRequest, componentSupplier),
        UIFragmentActionDto.Replace,
        component != null ? component.containerId() : null);
  }

  public static Object getData(HttpRequest httpRequest, Object instance) {
    if (instance instanceof DataSupplier dataSupplier) {
      return dataSupplier.data(httpRequest);
    }
    var data = getData(httpRequest);
    if (data == null && instance != null) {
      return createData(instance, httpRequest);
    }
    return data;
  }

  public static Object getData(HttpRequest httpRequest) {
    if (httpRequest == null) {
      return null;
    }
    var data = httpRequest.getAttribute("data");
    if (data instanceof Optional<?>) {
      data = ((Optional<?>) data).orElse(null);
    }
    return data;
  }

  public static ComponentDto mapComponentToDto(
      ComponentTreeSupplier componentSupplier,
      Component component,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    if (component == null && componentSupplier != null) {
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
      return mapComponentTreeSupplierToDto(
          componentTreeSupplier, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (component instanceof Page page) {
      return mapPageToDto(
          page,
          componentSupplier,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest);
    }
    if (component instanceof App app) {
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
