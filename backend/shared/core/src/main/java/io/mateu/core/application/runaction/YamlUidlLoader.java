package io.mateu.core.application.runaction;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Slf4j
@Named
@Singleton
public class YamlUidlLoader {

  private final ObjectMapper mapper;

  public YamlUidlLoader() {
    mapper = new ObjectMapper(new YAMLFactory());
    mapper.registerModule(new JavaTimeModule());

    mapper.addMixIn(Component.class, PolymorphicMixin.class);
    mapper.addMixIn(Actionable.class, PolymorphicMixin.class);
    mapper.addMixIn(GridContent.class, PolymorphicMixin.class);
    mapper.addMixIn(FieldValidation.class, PolymorphicMixin.class);

    mapper.registerSubtypes(
        // Component subtypes
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
        new NamedType(WorkflowElk.class, "WorkflowElk"),
        // Actionable subtypes
        new NamedType(ContentLink.class, "ContentLink"),
        new NamedType(FieldLink.class, "FieldLink"),
        new NamedType(Menu.class, "Menu"),
        new NamedType(MenuSeparator.class, "MenuSeparator"),
        new NamedType(MethodLink.class, "MethodLink"),
        new NamedType(RemoteMenu.class, "RemoteMenu"),
        new NamedType(RouteLink.class, "RouteLink"),
        // FieldValidation subtypes
        new NamedType(JsValidation.class, "JsValidation"),
        new NamedType(MinValidation.class, "MinValidation"),
        new NamedType(MaxValidation.class, "MaxValidation"),
        new NamedType(PatternValidation.class, "PatternValidation"));
  }

  @JsonTypeInfo(
      use = JsonTypeInfo.Id.NAME,
      property = "type",
      include = JsonTypeInfo.As.PROPERTY,
      visible = false)
  abstract static class PolymorphicMixin {}

  public Component loadFromSpec(String specPath) {
    var cl = Thread.currentThread().getContextClassLoader();
    var resource = cl.getResourceAsStream(specPath);
    if (resource == null) {
      resource = YamlUidlLoader.class.getClassLoader().getResourceAsStream(specPath);
    }
    if (resource == null) {
      log.warn("No YAML spec found at classpath:{}", specPath);
      return null;
    }
    try (var is = resource) {
      return mapper.readValue(is, Component.class);
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", specPath, e.getMessage());
      return null;
    }
  }

  public Mono<Component> load(RunActionCommand command) {
    var route = stripQueryParams(command.route());
    if (route.startsWith("/")) {
      route = route.substring(1);
    }
    var yamlPath = "specs/ui/" + route + ".yaml";
    log.info("Looking for YAML spec at classpath:{}", yamlPath);

    var cl = Thread.currentThread().getContextClassLoader();
    var resource = cl.getResourceAsStream(yamlPath);
    if (resource == null) {
      resource = YamlUidlLoader.class.getClassLoader().getResourceAsStream(yamlPath);
    }
    if (resource == null) {
      log.info("No YAML spec found at {}", yamlPath);
      return Mono.empty();
    }

    try (var is = resource) {
      var component = mapper.readValue(is, Component.class);
      log.info("Loaded component from YAML spec: {}", yamlPath);
      return Mono.just(component);
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", yamlPath, e.getMessage());
      return Mono.empty();
    }
  }

  private String stripQueryParams(String route) {
    if (route == null) return "";
    int idx = route.indexOf('?');
    return idx >= 0 ? route.substring(0, idx) : route;
  }
}
