package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.AutoSaveTriggerDto;
import io.mateu.dtos.BannerThemeDto;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.NotificationVariantDto;
import io.mateu.dtos.OnCustomEventTriggerDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.SubscriptionSourceDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ConfirmOnNavigationIfDirty;
import io.mateu.uidl.annotations.Emits;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PageBanners;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.CustomEvent;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Integration tests (in-JVM, full sync pipeline) for the action machinery: what an @Action method
 * can return (commands, banners, messages, components, state), how component state round-trips
 * through an action run, how HttpRequest and typed rows are injected into action signatures, and
 * how class-level annotations (@SubscribeTo/@Emits/@Trigger/@AutoSave/@ConfirmOnNavigationIfDirty)
 * and @Toolbar/@Button/@Action methods surface in the wire DTOs.
 */
class ActionsAndCommandsSyncTest {

  // ---------------------------------------------------------------------------------------------
  // Fixtures
  // ---------------------------------------------------------------------------------------------

  /** Actions returning commands, components and plain values. */
  @SuppressWarnings("unused")
  @UI("/commands")
  public static class CommandForm {

    String name = "n";

    @Action
    URI goToDocs() {
      return URI.create("/docs");
    }

    @Action
    UICommand fireEvent() {
      return UICommand.dispatchEvent("guest-selected", Map.of("id", 7));
    }

    @Action
    UICommand ping() {
      return UICommand.dispatchEvent("ping");
    }

    @Action
    UICommand makeDirty() {
      return UICommand.markAsDirty();
    }

    @Action
    UICommand makeClean() {
      return UICommand.markAsClean();
    }

    @Action
    List<UICommand> saveAndNotify() {
      return List.of(UICommand.markAsClean(), UICommand.dispatchEvent("saved"));
    }

    @Action
    void noop() {}

    @Action
    String saludo() {
      return "hola";
    }

    @Action
    Text doneText() {
      return new Text("done");
    }
  }

  /** State round-trip + parameter injection. */
  @SuppressWarnings("unused")
  @UI("/counter")
  public static class CounterForm {

    static int seenCounter;
    static String seenName;
    static HttpRequest seenRequest;
    static RowItem seenRow;
    static List<RowItem> seenRows;

    int counter = 0;
    String name = "ada";

    @Action
    void increment() {
      seenCounter = counter;
      seenName = name;
      counter++;
      name = name.toUpperCase();
    }

    @Action
    void capture(HttpRequest request) {
      seenRequest = request;
    }

    @Action
    void rowClicked(RowItem row) {
      seenRow = row;
    }

    @Action
    void bulk(List<RowItem> rows) {
      seenRows = rows;
    }

    @Action
    Object mutateAndReturnState() {
      counter = 100;
      name = "mutated";
      return new State(this);
    }
  }

  public static class RowItem {
    public int id;
    public String label;
  }

  /** Toolbar/button methods with shortcuts, confirmation and validation flags. */
  @SuppressWarnings("unused")
  @UI("/toolbar")
  @Title("Toolbar fixture")
  public static class ToolbarForm {

    String name = "x";

    @Toolbar
    @Action(shortcut = "ctrl+s")
    @Label("Guardar")
    void save() {}

    @Button
    @Label("Reiniciar")
    void reset() {}

    @Action(
        confirmationRequired = true,
        confirmationTitle = "Sure?",
        confirmationMessage = "Really delete?",
        confirmationText = "Yes",
        confirmationDenialText = "No")
    void confirmDelete() {}

    @Action(validationRequired = true)
    void validateAndSave() {}
  }

  /** Class-level triggers, subscriptions and emits name. */
  @SuppressWarnings("unused")
  @UI("/triggers")
  @Emits(name = "triggers-panel", events = "pax-selected")
  @SubscribeTo(event = "checkin-confirmed", action = "reload")
  @SubscribeTo(
      event = "pax-selected",
      action = "loadPax",
      source = SubscriptionSource.COMPONENT,
      from = "guests")
  @Trigger(type = TriggerType.OnLoad, actionId = "search", timeoutMillis = 250, times = 3)
  public static class TriggerForm {

    String q = "";

    @Action
    void reload() {}

    @Action
    void loadPax() {}

    @Action
    void search() {}
  }

  /** AutoSave metadata + dirty-navigation guard flag. */
  @SuppressWarnings("unused")
  @UI("/autosave")
  @AutoSave(debounceMillis = 500, action = "persist")
  @ConfirmOnNavigationIfDirty
  public static class AutoSaveForm {

    String draft = "";

    @Action
    void persist() {}
  }

  /** Actions returning toasts and banners. */
  @SuppressWarnings("unused")
  @UI("/feedback")
  public static class FeedbackForm {

    String name = "y";

    @Action
    Message toast() {
      return Message.success("Saved!");
    }

    @Action
    List<Object> mixed() {
      return List.of(Message.error("boom"), UICommand.markAsDirty());
    }

    @Action
    PageBanner oneBanner() {
      return new PageBanner(BannerTheme.INFO, "Heads up", "Something happened", true, 9);
    }

    @Action
    List<PageBanner> twoBanners() {
      return List.of(
          new PageBanner(BannerTheme.SUCCESS, "First", "one"),
          new PageBanner(BannerTheme.DANGER, "Second", "two"));
    }

    @Action
    PageBanners appendBanner() {
      return PageBanners.append(new PageBanner(BannerTheme.WARNING, "More", "appended"));
    }

    @Action
    PageBanners replaceBanner() {
      return PageBanners.replace(new PageBanner(BannerTheme.INFO, "Only", "replaced"));
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Harness
  // ---------------------------------------------------------------------------------------------

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            CommandForm.class,
            CounterForm.class,
            ToolbarForm.class,
            TriggerForm.class,
            AutoSaveForm.class,
            FeedbackForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void resetHolders() {
    CounterForm.seenCounter = -1;
    CounterForm.seenName = null;
    CounterForm.seenRequest = null;
    CounterForm.seenRow = null;
    CounterForm.seenRows = null;
  }

  private static UIIncrementDto run(String route, Class<?> type, String actionId) {
    return run(route, type, actionId, Map.of(), null);
  }

  private static UIIncrementDto run(
      String route,
      Class<?> type,
      String actionId,
      Map<String, Object> componentState,
      Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .actionId(actionId)
            .serverSideType(type.getName())
            .initiatorComponentId("cmp-1")
            .componentState(componentState)
            .parameters(parameters)
            .build());
  }

  private static List<UICommandDto> commandsOfType(
      UIIncrementDto increment, UICommandTypeDto type) {
    return increment.commands().stream().filter(c -> c.type() == type).toList();
  }

  private static ServerSideComponentDto syncComponent(String route) {
    var increment = mateu.sync(route);
    assertThat(increment.fragments()).isNotEmpty();
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  // ---------------------------------------------------------------------------------------------
  // Commands returned from actions
  // ---------------------------------------------------------------------------------------------

  @Test
  void uriReturnBecomesNavigateToCommandAndNoFragment() {
    var increment = run("/commands", CommandForm.class, "goToDocs");
    var navigations = commandsOfType(increment, UICommandTypeDto.NavigateTo);
    assertThat(navigations).hasSize(1);
    assertThat(navigations.get(0).data()).isEqualTo("/docs");
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void dispatchEventWithPayloadBecomesDispatchEventCommand() {
    var increment = run("/commands", CommandForm.class, "fireEvent");
    var dispatches = commandsOfType(increment, UICommandTypeDto.DispatchEvent);
    assertThat(dispatches).hasSize(1);
    var event = (CustomEvent) dispatches.get(0).data();
    assertThat(event.eventName()).isEqualTo("guest-selected");
    assertThat(event.detail()).isEqualTo(Map.of("id", 7));
  }

  @Test
  void dispatchEventWithoutPayloadHasNullDetail() {
    var increment = run("/commands", CommandForm.class, "ping");
    var dispatches = commandsOfType(increment, UICommandTypeDto.DispatchEvent);
    assertThat(dispatches).hasSize(1);
    var event = (CustomEvent) dispatches.get(0).data();
    assertThat(event.eventName()).isEqualTo("ping");
    assertThat(event.detail()).isNull();
  }

  @Test
  void markAsDirtyBecomesMarkAsDirtyCommand() {
    var increment = run("/commands", CommandForm.class, "makeDirty");
    assertThat(commandsOfType(increment, UICommandTypeDto.MarkAsDirty)).hasSize(1);
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void markAsCleanBecomesMarkAsCleanCommand() {
    var increment = run("/commands", CommandForm.class, "makeClean");
    assertThat(commandsOfType(increment, UICommandTypeDto.MarkAsClean)).hasSize(1);
  }

  @Test
  void listOfCommandsMapsAllInOrderAndProducesNoFragments() {
    var increment = run("/commands", CommandForm.class, "saveAndNotify");
    assertThat(increment.commands()).hasSize(2);
    assertThat(increment.commands().get(0).type()).isEqualTo(UICommandTypeDto.MarkAsClean);
    assertThat(increment.commands().get(1).type()).isEqualTo(UICommandTypeDto.DispatchEvent);
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void commandsTargetTheInitiatorComponent() {
    var increment = run("/commands", CommandForm.class, "goToDocs");
    assertThat(increment.commands()).isNotEmpty();
    assertThat(increment.commands().get(0).targetComponentId()).isEqualTo("cmp-1");
  }

  // ---------------------------------------------------------------------------------------------
  // Fragments returned from actions
  // ---------------------------------------------------------------------------------------------

  @Test
  void voidActionReturnsStateReplaceFragmentTargetingInitiator() {
    var increment = run("/commands", CommandForm.class, "noop", Map.of("name", "modified"), null);
    assertThat(increment.fragments()).hasSize(1);
    var fragment = increment.fragments().get(0);
    assertThat(fragment.component()).isNull();
    assertThat(fragment.action()).isEqualTo(UIFragmentActionDto.Replace);
    assertThat(fragment.targetComponentId()).isEqualTo("cmp-1");
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) fragment.state();
    assertThat(state).containsEntry("name", "modified");
  }

  @Test
  void stringReturnProducesAFragment() {
    var increment = run("/commands", CommandForm.class, "saludo");
    assertThat(increment.fragments()).hasSize(1);
  }

  @Test
  void componentReturnProducesReplacementFragmentWithComponent() {
    var increment = run("/commands", CommandForm.class, "doneText");
    assertThat(increment.fragments()).hasSize(1);
    var fragment = increment.fragments().get(0);
    assertThat(fragment.component()).isNotNull();
    assertThat(fragment.action()).isEqualTo(UIFragmentActionDto.Replace);
  }

  // ---------------------------------------------------------------------------------------------
  // State round-trip + parameter injection
  // ---------------------------------------------------------------------------------------------

  @Test
  void actionMethodSeesTheSubmittedComponentState() {
    run("/counter", CounterForm.class, "increment", Map.of("counter", 41, "name", "eva"), null);
    assertThat(CounterForm.seenCounter).isEqualTo(41);
    assertThat(CounterForm.seenName).isEqualTo("eva");
  }

  @Test
  void mutationsMadeByTheActionFlowBackIntoTheFragmentState() {
    var increment =
        run("/counter", CounterForm.class, "increment", Map.of("counter", 41, "name", "eva"), null);
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) increment.fragments().get(0).state();
    assertThat(state).containsEntry("counter", 42).containsEntry("name", "EVA");
  }

  @Test
  void httpRequestIsInjectedIntoTheActionSignature() {
    run("/counter", CounterForm.class, "capture");
    assertThat(CounterForm.seenRequest).isNotNull();
    assertThat(CounterForm.seenRequest.runActionRq().actionId()).isEqualTo("capture");
  }

  @Test
  void clickedRowParameterIsInjectedAsTypedRow() {
    run(
        "/counter",
        CounterForm.class,
        "rowClicked",
        Map.of(),
        Map.of("_clickedRow", Map.of("id", 5, "label", "X")));
    assertThat(CounterForm.seenRow).isNotNull();
    assertThat(CounterForm.seenRow.id).isEqualTo(5);
    assertThat(CounterForm.seenRow.label).isEqualTo("X");
  }

  @Test
  void selectedRowsListParameterIsInjectedAsTypedRows() {
    run(
        "/counter",
        CounterForm.class,
        "bulk",
        Map.of(
            "crud_selected_items",
            List.of(Map.of("id", 1, "label", "a"), Map.of("id", 2, "label", "b"))),
        null);
    assertThat(CounterForm.seenRows).hasSize(2);
    assertThat(CounterForm.seenRows.get(0).id).isEqualTo(1);
    assertThat(CounterForm.seenRows.get(1).label).isEqualTo("b");
  }

  @Test
  void returningStateOfThisReflectsMutationsAsAStateOnlyReplaceFragment() {
    var increment =
        run(
            "/counter",
            CounterForm.class,
            "mutateAndReturnState",
            Map.of("counter", 1, "name", "before"),
            null);
    assertThat(increment.fragments()).hasSize(1);
    var fragment = increment.fragments().get(0);
    assertThat(fragment.component()).isNull();
    assertThat(fragment.action()).isEqualTo(UIFragmentActionDto.Replace);
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) fragment.state();
    assertThat(state).containsEntry("counter", 100).containsEntry("name", "mutated");
  }

  // ---------------------------------------------------------------------------------------------
  // Toolbar / buttons / action flags on sync
  // ---------------------------------------------------------------------------------------------

  @Test
  void toolbarMethodIsEmittedAsToolbarButtonWithLabel() {
    var component = syncComponent("/toolbar");
    var page = FullSyncPipelineTest.findMetadata(component, PageDto.class);
    assertThat(page).isNotNull();
    assertThat(page.toolbar())
        .anySatisfy(
            button -> {
              assertThat(button.actionId()).isEqualTo("save");
              assertThat(button.label()).isEqualTo("Guardar");
            });
  }

  @Test
  void buttonMethodIsEmittedAsBottomButton() {
    var component = syncComponent("/toolbar");
    var page = FullSyncPipelineTest.findMetadata(component, PageDto.class);
    assertThat(page).isNotNull();
    assertThat(page.buttons()).extracting(ButtonDto::actionId).contains("reset");
  }

  @Test
  void actionShortcutTravelsInTheComponentActionsList() {
    var component = syncComponent("/toolbar");
    assertThat(component.actions())
        .anySatisfy(
            action -> {
              assertThat(action.id()).isEqualTo("save");
              assertThat(action.shortcut()).isEqualTo("ctrl+s");
            });
  }

  @Test
  void confirmationRequiredActionCarriesConfirmationTexts() {
    var component = syncComponent("/toolbar");
    ActionDto action =
        component.actions().stream()
            .filter(a -> "confirmDelete".equals(a.id()))
            .findFirst()
            .orElseThrow();
    assertThat(action.confirmationRequired()).isTrue();
    assertThat(action.confirmationTexts()).isNotNull();
    assertThat(action.confirmationTexts().title()).isEqualTo("Sure?");
    assertThat(action.confirmationTexts().message()).isEqualTo("Really delete?");
    assertThat(action.confirmationTexts().confirmationText()).isEqualTo("Yes");
    assertThat(action.confirmationTexts().denialText()).isEqualTo("No");
  }

  @Test
  void validationRequiredFlagTravelsOnTheActionDto() {
    var component = syncComponent("/toolbar");
    assertThat(
            component.actions().stream()
                .filter(a -> "validateAndSave".equals(a.id()))
                .findFirst()
                .orElseThrow()
                .validationRequired())
        .isTrue();
    // a @Button method without @Action defaults to validationRequired = true
    assertThat(
            component.actions().stream()
                .filter(a -> "reset".equals(a.id()))
                .findFirst()
                .orElseThrow()
                .validationRequired())
        .isTrue();
  }

  // ---------------------------------------------------------------------------------------------
  // Triggers, subscriptions, emits
  // ---------------------------------------------------------------------------------------------

  @Test
  void subscribeToDocumentMapsToOnCustomEventTrigger() {
    var component = syncComponent("/triggers");
    var trigger =
        component.triggers().stream()
            .filter(t -> t instanceof OnCustomEventTriggerDto)
            .map(t -> (OnCustomEventTriggerDto) t)
            .filter(t -> "checkin-confirmed".equals(t.eventName()))
            .findFirst()
            .orElseThrow();
    assertThat(trigger.actionId()).isEqualTo("reload");
    assertThat(trigger.source()).isEqualTo(SubscriptionSourceDto.DOCUMENT);
    assertThat(trigger.from()).isNull();
  }

  @Test
  void subscribeToComponentCarriesSourceAndFrom() {
    var component = syncComponent("/triggers");
    var trigger =
        component.triggers().stream()
            .filter(t -> t instanceof OnCustomEventTriggerDto)
            .map(t -> (OnCustomEventTriggerDto) t)
            .filter(t -> "pax-selected".equals(t.eventName()))
            .findFirst()
            .orElseThrow();
    assertThat(trigger.actionId()).isEqualTo("loadPax");
    assertThat(trigger.source()).isEqualTo(SubscriptionSourceDto.COMPONENT);
    assertThat(trigger.from()).isEqualTo("guests");
  }

  @Test
  void rawOnLoadTriggerMapsWithTimeout() {
    var component = syncComponent("/triggers");
    var trigger =
        component.triggers().stream()
            .filter(t -> t instanceof OnLoadTriggerDto)
            .map(t -> (OnLoadTriggerDto) t)
            .findFirst()
            .orElseThrow();
    assertThat(trigger.actionId()).isEqualTo("search");
    assertThat(trigger.timeoutMillis()).isEqualTo(250);
  }

  @Test
  void emitsNameIsStampedOnTheServerSideComponent() {
    var component = syncComponent("/triggers");
    assertThat(component.emitsName()).isEqualTo("triggers-panel");
  }

  // ---------------------------------------------------------------------------------------------
  // AutoSave + dirty navigation guard
  // ---------------------------------------------------------------------------------------------

  @Test
  void autoSaveClassAnnotationEmitsAutoSaveTrigger() {
    var component = syncComponent("/autosave");
    var trigger =
        component.triggers().stream()
            .filter(t -> t instanceof AutoSaveTriggerDto)
            .map(t -> (AutoSaveTriggerDto) t)
            .findFirst()
            .orElseThrow();
    assertThat(trigger.actionId()).isEqualTo("persist");
    assertThat(trigger.debounceMillis()).isEqualTo(500);
  }

  @Test
  void autoSaveAdvertisesWildcardAction() {
    var component = syncComponent("/autosave");
    assertThat(component.actions()).extracting(ActionDto::id).contains("*");
  }

  @Test
  void confirmOnNavigationIfDirtyFlagTravelsOnTheComponent() {
    assertThat(syncComponent("/autosave").confirmOnNavigationIfDirty()).isTrue();
    assertThat(syncComponent("/commands").confirmOnNavigationIfDirty()).isFalse();
  }

  // ---------------------------------------------------------------------------------------------
  // Messages (toasts) and banners
  // ---------------------------------------------------------------------------------------------

  @Test
  void messageReturnBecomesToastWithDefaultDuration() {
    var increment = run("/feedback", FeedbackForm.class, "toast");
    assertThat(increment.messages()).hasSize(1);
    var message = increment.messages().get(0);
    assertThat(message.variant()).isEqualTo(NotificationVariantDto.success);
    assertThat(message.text()).isEqualTo("Saved!");
    assertThat(message.duration()).isEqualTo(3000);
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void mixedListReturnsMessageAndCommandTogether() {
    var increment = run("/feedback", FeedbackForm.class, "mixed");
    assertThat(increment.messages()).hasSize(1);
    assertThat(increment.messages().get(0).variant()).isEqualTo(NotificationVariantDto.error);
    assertThat(commandsOfType(increment, UICommandTypeDto.MarkAsDirty)).hasSize(1);
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void singleBannerReturnTravelsInIncrementBanners() {
    var increment = run("/feedback", FeedbackForm.class, "oneBanner");
    assertThat(increment.banners()).hasSize(1);
    var banner = increment.banners().get(0);
    assertThat(banner.theme()).isEqualTo(BannerThemeDto.INFO);
    assertThat(banner.title()).isEqualTo("Heads up");
    assertThat(banner.description()).isEqualTo("Something happened");
    assertThat(banner.hasCloseButton()).isTrue();
    assertThat(banner.timeoutSeconds()).isEqualTo(9);
    assertThat(increment.appendBanners()).isFalse();
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void listOfBannersMapsAllWithoutFragments() {
    var increment = run("/feedback", FeedbackForm.class, "twoBanners");
    assertThat(increment.banners()).hasSize(2);
    assertThat(increment.banners().get(0).theme()).isEqualTo(BannerThemeDto.SUCCESS);
    assertThat(increment.banners().get(1).theme()).isEqualTo(BannerThemeDto.DANGER);
    assertThat(increment.appendBanners()).isFalse();
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void pageBannersAppendSetsAppendFlag() {
    var increment = run("/feedback", FeedbackForm.class, "appendBanner");
    assertThat(increment.banners()).hasSize(1);
    assertThat(increment.banners().get(0).title()).isEqualTo("More");
    assertThat(increment.appendBanners()).isTrue();
    assertThat(increment.fragments()).isEmpty();
  }

  @Test
  void pageBannersReplaceKeepsAppendFlagOff() {
    var increment = run("/feedback", FeedbackForm.class, "replaceBanner");
    assertThat(increment.banners()).hasSize(1);
    assertThat(increment.banners().get(0).title()).isEqualTo("Only");
    assertThat(increment.appendBanners()).isFalse();
  }
}
