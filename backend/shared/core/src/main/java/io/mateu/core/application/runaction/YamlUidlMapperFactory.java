package io.mateu.core.application.runaction;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.jsontype.NamedType;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.mateu.uidl.data.*;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.Listing;
import io.mateu.uidl.fluent.MenuBar;
import io.mateu.uidl.fluent.UserTrigger;
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
    // A definition may carry authoring-only keys the model does not model — a `$schema` reference
    // (for editor IntelliSense) or a future field — so unknown properties are ignored rather than
    // rejected. Without this a bare-component page with `$schema:` would fail to deserialize.
    mapper.configure(
        com.fasterxml.jackson.databind.DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    mapper.addMixIn(Component.class, PolymorphicMixin.class);
    mapper.addMixIn(Actionable.class, PolymorphicMixin.class);
    // A `toolbar:`/`buttons:` list is typed UserTrigger, and the generated schema has always
    // advertised it (Button | ButtonGroup) — but without the mixin Jackson could not build one, so
    // the whole definition failed to parse and the page fell back to "Not found". The schema and
    // the mapper have to agree on what is authorable.
    mapper.addMixIn(UserTrigger.class, PolymorphicMixin.class);
    mapper.addMixIn(GridContent.class, PolymorphicMixin.class);
    mapper.addMixIn(FieldValidation.class, PolymorphicMixin.class);

    mapper.registerSubtypes(
        new NamedType(AppShell.class, "AppShell"),
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
        new NamedType(Partial.class, "Partial"),
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
        new NamedType(Listing.class, "Listing"),
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
        // The rest of the authoring catalogue. These were authorable per the generated schema but
        // never registered here, so a YAML page using any of them failed to deserialise — the same
        // drift that hid Listing. YamlComponentRegistrationTest now pins this list against the
        // schema.
        new NamedType(AddOnPicker.class, "AddOnPicker"),
        new NamedType(BulletedList.class, "BulletedList"),
        new NamedType(ButtonGroup.class, "ButtonGroup"),
        new NamedType(Calendar.class, "Calendar"),
        new NamedType(CalloutCard.class, "CalloutCard"),
        new NamedType(Checklist.class, "Checklist"),
        new NamedType(CommentThread.class, "CommentThread"),
        new NamedType(ComparisonCard.class, "ComparisonCard"),
        new NamedType(ContentLayout.class, "ContentLayout"),
        new NamedType(DashboardLayout.class, "DashboardLayout"),
        new NamedType(DashboardPanel.class, "DashboardPanel"),
        new NamedType(EmbeddedView.class, "EmbeddedView"),
        new NamedType(EmptyState.class, "EmptyState"),
        new NamedType(EntityHeader.class, "EntityHeader"),
        new NamedType(Faq.class, "Faq"),
        new NamedType(FeatureGrid.class, "FeatureGrid"),
        new NamedType(FileList.class, "FileList"),
        new NamedType(FoldoutLayout.class, "FoldoutLayout"),
        new NamedType(FoldoutPanel.class, "FoldoutPanel"),
        new NamedType(Form.class, "Form"),
        new NamedType(Funnel.class, "Funnel"),
        new NamedType(Gantt.class, "Gantt"),
        new NamedType(Heatmap.class, "Heatmap"),
        new NamedType(HeroSection.class, "HeroSection"),
        new NamedType(Kanban.class, "Kanban"),
        new NamedType(Ledger.class, "Ledger"),
        new NamedType(MenuBar.class, "MenuBar"),
        new NamedType(Meter.class, "Meter"),
        new NamedType(MetricCard.class, "MetricCard"),
        new NamedType(Notice.class, "Notice"),
        new NamedType(OfferCard.class, "OfferCard"),
        new NamedType(OrgChart.class, "OrgChart"),
        new NamedType(PaymentPicker.class, "PaymentPicker"),
        new NamedType(PlanningBoard.class, "PlanningBoard"),
        new NamedType(PricingTable.class, "PricingTable"),
        new NamedType(ProcessMonitor.class, "ProcessMonitor"),
        new NamedType(ProgressSteps.class, "ProgressSteps"),
        new NamedType(ResourceGrid.class, "ResourceGrid"),
        new NamedType(Scoreboard.class, "Scoreboard"),
        new NamedType(Separator.class, "Separator"),
        new NamedType(Skeleton.class, "Skeleton"),
        new NamedType(Stat.class, "Stat"),
        new NamedType(StatusList.class, "StatusList"),
        new NamedType(TaskProgress.class, "TaskProgress"),
        new NamedType(TaskQueue.class, "TaskQueue"),
        new NamedType(Testimonials.class, "Testimonials"),
        new NamedType(Timeline.class, "Timeline"),
        new NamedType(TrendChart.class, "TrendChart"),
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
