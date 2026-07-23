package io.mateu.core.application.runaction;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;

final class YamlUidlMapperFactory {

  @JsonTypeInfo(
      use = JsonTypeInfo.Id.NAME,
      property = "type",
      include = JsonTypeInfo.As.PROPERTY,
      visible = false)
  abstract static class PolymorphicMixin {}

  static ObjectMapper create() {
    var mapper = new ObjectMapper(new YAMLFactory());
    mapper.registerModule(new JavaTimeModule());

    mapper.addMixIn(Component.class, PolymorphicMixin.class);
    mapper.addMixIn(Actionable.class, PolymorphicMixin.class);
    mapper.addMixIn(GridContent.class, PolymorphicMixin.class);
    mapper.addMixIn(FieldValidation.class, PolymorphicMixin.class);

    mapper.registerSubtypes(
        new NamedType(AccordionLayout.class, "AccordionLayout"),
        new NamedType(AccordionPanel.class, "AccordionPanel"),
        new NamedType(Anchor.class, "Anchor"),
        new NamedType(AppData.class, "AppData"),
        new NamedType(AppState.class, "AppState"),
        new NamedType(Avatar.class, "Avatar"),
        new NamedType(AvatarGroup.class, "AvatarGroup"),
        new NamedType(Badge.class, "Badge"),
        new NamedType(BoardLayout.class, "BoardLayout"),
        new NamedType(BoardLayoutItem.class, "BoardLayoutItem"),
        new NamedType(BoardLayoutRow.class, "BoardLayoutRow"),
        new NamedType(Bpmn.class, "Bpmn"),
        new NamedType(Breadcrumbs.class, "Breadcrumbs"),
        new NamedType(Button.class, "Button"),
        new NamedType(Card.class, "Card"),
        new NamedType(CarouselLayout.class, "CarouselLayout"),
        new NamedType(Chart.class, "Chart"),
        new NamedType(Chat.class, "Chat"),
        new NamedType(ConfirmDialog.class, "ConfirmDialog"),
        new NamedType(Container.class, "Container"),
        new NamedType(ContextMenu.class, "ContextMenu"),
        new NamedType(CookieConsent.class, "CookieConsent"),
        new NamedType(CustomField.class, "CustomField"),
        new NamedType(Data.class, "Data"),
        new NamedType(Details.class, "Details"),
        new NamedType(Dialog.class, "Dialog"),
        new NamedType(Directory.class, "Directory"),
        new NamedType(Drawer.class, "Drawer"),
        new NamedType(Div.class, "Div"),
        new NamedType(Element.class, "Element"),
        new NamedType(FormEditor.class, "FormEditor"),
        new NamedType(FormField.class, "FormField"),
        new NamedType(FormItem.class, "FormItem"),
        new NamedType(FormLayout.class, "FormLayout"),
        new NamedType(FormRow.class, "FormRow"),
        new NamedType(FormSection.class, "FormSection"),
        new NamedType(FormSubSection.class, "FormSubSection"),
        new NamedType(FullWidth.class, "FullWidth"),
        new NamedType(FutureComponent.class, "FutureComponent"),
        new NamedType(Grid.class, "Grid"),
        new NamedType(GridColumn.class, "GridColumn"),
        new NamedType(GridGroupColumn.class, "GridGroupColumn"),
        new NamedType(HorizontalLayout.class, "HorizontalLayout"),
        new NamedType(Icon.class, "Icon"),
        new NamedType(Image.class, "Image"),
        new NamedType(KPI.class, "KPI"),
        new NamedType(Map.class, "Map"),
        new NamedType(Markdown.class, "Markdown"),
        new NamedType(MasterDetailLayout.class, "MasterDetailLayout"),
        new NamedType(MessageInput.class, "MessageInput"),
        new NamedType(MessageList.class, "MessageList"),
        new NamedType(MicroFrontend.class, "MicroFrontend"),
        new NamedType(Notification.class, "Notification"),
        new NamedType(Popover.class, "Popover"),
        new NamedType(ProgressBar.class, "ProgressBar"),
        new NamedType(Scroller.class, "Scroller"),
        new NamedType(SplitLayout.class, "SplitLayout"),
        new NamedType(State.class, "State"),
        new NamedType(Tab.class, "Tab"),
        new NamedType(TabLayout.class, "TabLayout"),
        new NamedType(Text.class, "Text"),
        new NamedType(Tooltip.class, "Tooltip"),
        new NamedType(VerticalLayout.class, "VerticalLayout"),
        new NamedType(VirtualList.class, "VirtualList"),
        new NamedType(Workflow.class, "Workflow"),
        new NamedType(ContentLink.class, "ContentLink"),
        new NamedType(FieldLink.class, "FieldLink"),
        new NamedType(Menu.class, "Menu"),
        new NamedType(MenuSeparator.class, "MenuSeparator"),
        new NamedType(MethodLink.class, "MethodLink"),
        new NamedType(RemoteMenu.class, "RemoteMenu"),
        new NamedType(RouteLink.class, "RouteLink"),
        new NamedType(JsValidation.class, "JsValidation"),
        new NamedType(MinValidation.class, "MinValidation"),
        new NamedType(MaxValidation.class, "MaxValidation"),
        new NamedType(PatternValidation.class, "PatternValidation"));

    return mapper;
  }
}
