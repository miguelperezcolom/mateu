package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.core.domain.out.componentmapper.TranslatorContext;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.WizardLabels;
import io.mateu.uidl.annotations.WizardLayoutMode;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.*;
import io.mateu.uidl.interfaces.Draftable;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.reactivestreams.Publisher;

@Slf4j
public abstract class Wizard
    implements ActionHandler,
        RouteHandler,
        ComponentTreeSupplier,
        StateSupplier,
        ValidationSupplier,
        ActionSupplier,
        PostHydrationHandler {

  int position = 0;

  @Override
  public Object state(HttpRequest httpRequest) {
    return WizardStateSerializer.buildState(this);
  }

  public static void addRowNumber(Class<?> type, Map<String, Object> data) {
    WizardStateSerializer.addRowNumber(type, data);
  }

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    var state = httpRequest.runActionRq().componentState();
    final InstanceFactory instanceFactory = MateuBeanProvider.getBean(InstanceFactory.class);
    try {
      setValue(
          currentStepField(),
          this,
          instanceFactory.newInstance(currentStepField().getType(), state, httpRequest));
    } catch (Exception e) {
      log.error("Failed to hydrate wizard step", e);
    }
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    return WizardActionDispatcher.dispatch(actionId, this, httpRequest);
  }

  @Override
  public Object handleRoute(String route, HttpRequest httpRequest) {
    // A Draftable wizard opened afresh (no position in the state yet) resumes on the step the user
    // left (the Redwood guided-process resumeStepId).
    if (this instanceof Draftable draftable && !hasPosition(httpRequest)) {
      var resume = draftable.resumeStep(httpRequest);
      if (resume != null && !resume.isBlank()) {
        var fields = WizardStepInspector.getStepFields(this);
        for (int i = 0; i < fields.size() - 1; i++) {
          if (fields.get(i).getName().equals(resume) && applies(i)) {
            position = i;
            break;
          }
        }
      }
    }
    return this;
  }

  private static boolean hasPosition(HttpRequest httpRequest) {
    var rq = httpRequest != null ? httpRequest.runActionRq() : null;
    var state = rq != null ? rq.componentState() : null;
    return state != null && state.get("position") != null;
  }

  /**
   * This wizard's built-in affordances (the Redwood guided-process {@code displayOptions}): the
   * draft buttons of a {@link Draftable} wizard and the "Skip" button of {@link #stepSkippable}
   * steps — each {@code on}, {@code off} or {@code disabled}. Override to switch them.
   */
  @Experimental("archetype display options (3.0-alpha.409)")
  protected WizardDisplay display() {
    return WizardDisplay.defaults();
  }

  /**
   * Whether the user may SKIP the step held by the given field (the Redwood guided-process {@code
   * spSkip}): a "Skip" button moves on to the next step without requiring that step's fields —
   * unlike {@link #stepApplies}, which removes a step the answers made irrelevant, a skippable step
   * is still there, the user just chooses not to fill it in now. Default: no step is skippable.
   */
  @Experimental("skippable wizard steps (3.0-alpha.409)")
  protected boolean stepSkippable(String stepFieldName) {
    return false;
  }

  /**
   * Cancelable hook run BEFORE the wizard moves from one step to another (the Redwood
   * guided-process {@code spBeforeStepNavigate}/{@code spBeforeNext}): Next, Back, Skip, a jump to
   * a visited step and the completion action (whose {@code toStep} is the result step) all pass
   * through it, after the current step has been hydrated and — going forward — its required fields
   * checked. Return null to let the move happen; anything else cancels it and becomes the response
   * (typically a {@code Message.error(...)} explaining why). Default: never cancels.
   */
  @Experimental("cancelable before-step hook (3.0-alpha.409)")
  protected Object beforeStepNavigate(String fromStep, String toStep, HttpRequest httpRequest) {
    return null;
  }

  /** The step field name at an index (null when out of range). */
  String stepName(int index) {
    var fields = WizardStepInspector.getStepFields(this);
    return index >= 0 && index < fields.size() ? fields.get(index).getName() : null;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    // Branching: the wizard may OPEN on a non-applicable leading step (navigation already skips
    // in both directions, but the initial position was always 0) — fast-forward to the first
    // applicable step so e.g. a check-in with complete documentation starts at Extras.
    while (position < numberOfSteps() - 1 && !applies(position)) {
      position++;
    }
    var rail = progressStyle() == io.mateu.uidl.annotations.WizardProgressStyle.RAIL;
    var content = new ArrayList<Component>();
    content.add(
        Text.builder()
            .text(getTitle(this))
            .container(TextContainer.h2)
            .style("margin: 0;")
            .build());
    var subtitle = subtitle();
    if (subtitle != null && !subtitle.isBlank()) {
      // the process's subtitle: under the title, and in Redwood's Guided Process overview under
      // the process title (the class is how the renderer tells it from the step's own texts)
      content.add(
          Text.builder()
              .text(subtitle)
              .container(TextContainer.p)
              .cssClasses("mateu-wizard-subtitle")
              .style("margin: 0;")
              .build());
    }
    if (!rail) {
      content.add(progressIndicator());
    }

    var mode = layoutMode();
    if (mode == WizardLayoutMode.ACCORDION || mode == WizardLayoutMode.ACCUMULATIVE) {
      // These modes render several steps' forms at once into a single flattened state map, so two
      // steps sharing a field name would collide (one step's value would overwrite/mirror the
      // other's). Fail fast with an actionable message instead of corrupting data silently.
      WizardStepInspector.assertNoFieldNameCollisions(this);
    }

    switch (mode) {
      case ACCORDION -> content.add(accordionBody(httpRequest));
      case ACCUMULATIVE -> {
        // A single compact "previous answers" recap of every completed step, then the current
        // (editable) step below it.
        var recap = previousAnswersCard();
        if (recap != null) {
          content.add(recap);
        }
        content.add(currentStepBody(httpRequest));
      }
      default -> content.add(currentStepBody(httpRequest));
    }

    content.add(
        HorizontalLayout.builder()
            .justification(HorizontalLayoutJustification.END)
            .spacing(true)
            .content(WizardButtonBuilder.createButtons(this, httpRequest))
            .build());

    var main = VerticalLayout.builder().content(content).style("width: 100%").build();
    if (rail) {
      // Redwood "Guided Process": the step form on the left, a sticky rail on the right with a
      // big current|total counter over the vertical step list.
      return HorizontalLayout.builder()
          .spacing(true)
          .fullWidth(true)
          .style("align-items: flex-start; gap: 2rem; width: 100%;")
          .content(
              List.of(
                  VerticalLayout.builder()
                      .content(List.of(main))
                      .style("flex: 1; min-width: 0;")
                      .build(),
                  progressRail()))
          .build();
    }
    return main;
  }

  private Component progressRail() {
    var finished = position == numberOfSteps() - 1;
    // count real (non-result) steps only, like the step list itself
    var total = applicableSteps() - 1;
    var current = finished ? total : applicablePosition() + 1;
    return VerticalLayout.builder()
        .content(
            List.of(
                Text.builder()
                    .text(current + " | " + total)
                    .style(
                        "font-size: 2rem; font-weight: 300; margin: 0 0 1rem;"
                            + " letter-spacing: .1em;")
                    .build(),
                ProgressSteps.builder().steps(stepItems()).vertical(true).build()))
        .style(
            "flex: 0 0 15rem; align-self: flex-start; position: sticky; top: 1rem;"
                + " border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));"
                + " padding-left: 1.5rem;")
        .build();
  }

  /** The wizard's subtitle — {@code SubtitleSupplier} first, then {@code @Subtitle} — or null. */
  private String subtitle() {
    if (this instanceof SubtitleSupplier supplier) {
      return TranslatorContext.translate(supplier.subtitle());
    }
    var ann =
        io.mateu.core.infra.reflection.MetaAnnotations.find(
            getClass(), io.mateu.uidl.annotations.Subtitle.class);
    return ann != null ? TranslatorContext.translate(ann.value()) : null;
  }

  private WizardLayoutMode layoutMode() {
    var ann =
        io.mateu.core.infra.reflection.MetaAnnotations.find(
            getClass(), io.mateu.uidl.annotations.WizardLayout.class);
    return ann != null ? ann.value() : WizardLayoutMode.STEPS;
  }

  private io.mateu.uidl.annotations.WizardProgressStyle progressStyle() {
    var ann =
        io.mateu.core.infra.reflection.MetaAnnotations.find(
            getClass(), io.mateu.uidl.annotations.WizardProgress.class);
    return ann != null ? ann.value() : io.mateu.uidl.annotations.WizardProgressStyle.BAR;
  }

  /**
   * The wizard's progress visualization: the classic progress bar (default), or —
   * {@code @WizardProgress(WizardProgressStyle.STEPS)} — connected step bullets (the {@code
   * ProgressSteps} component): one dot per applicable non-result step with done/current/upcoming
   * states, all done while the result step shows.
   */
  private List<Step> stepItems() {
    var stepFields = WizardStepInspector.getStepFields(this);
    var finished = position == numberOfSteps() - 1;
    var items = new ArrayList<Step>();
    for (int i = 0; i < numberOfSteps() - 1; i++) {
      if (!applies(i)) {
        continue;
      }
      var status = finished || i < position ? "done" : i == position ? "current" : "upcoming";
      items.add(
          Step.builder()
              .id(stepFields.get(i).getName())
              .title(getLabel(stepFields.get(i)))
              .status(status)
              .build());
    }
    return items;
  }

  private Component progressIndicator() {
    if (progressStyle() == io.mateu.uidl.annotations.WizardProgressStyle.STEPS) {
      return ProgressSteps.builder().steps(stepItems()).style("width: 100%;").build();
    }
    return ProgressBar.builder()
        .value(position == numberOfSteps() - 1 ? applicableSteps() : applicablePosition())
        .max(applicableSteps())
        .text(getLabel(currentStepField()))
        .style("width: 100%;")
        .build();
  }

  /**
   * The current step's editable form (uses the plain field ids so state hydration keeps working).
   */
  private Component currentStepBody(HttpRequest httpRequest) {
    return Div.builder()
        .style("width: 100%; margin-top: 1rem;")
        .children(stepForm(getStep(), "", false, httpRequest))
        .build();
  }

  /**
   * A single compact card recapping every completed step as "label: value" lines, grouped under
   * each step's title. Far denser than one read-only form card per step. Returns {@code null} when
   * nothing has been answered yet (first step, or no non-empty values).
   */
  private Component previousAnswersCard() {
    if (position == 0) {
      return null;
    }
    var steps = WizardStepInspector.getStepFields(this);
    var body = new ArrayList<Component>();
    body.add(
        Text.builder()
            .text(translate("Previous answers", null))
            .container(TextContainer.h4)
            .style("margin: 0 0 0.25rem 0;")
            .build());
    boolean any = false;
    for (int i = 0; i < position; i++) {
      if (!applies(i)) {
        continue;
      }
      var lines = WizardStepInspector.getAnswerLines(this, i);
      if (lines.isEmpty()) {
        continue;
      }
      any = true;
      body.add(
          Text.builder()
              .text(getLabel(steps.get(i)))
              .container(TextContainer.h5)
              .style(
                  "margin: 0.5rem 0 0.15rem 0; color: var(--lumo-secondary-text-color);"
                      + " font-size: var(--lumo-font-size-s);")
              .build());
      lines.forEach(line -> body.add(answerLine(line)));
    }
    if (!any) {
      return null;
    }
    return Card.builder()
        .variants(List.of(CardVariant.outlined))
        .style("width: 100%;")
        .content(VerticalLayout.builder().content(body).style("gap: 0;").build())
        .build();
  }

  /** A single "label: value" row of the previous-answers recap. */
  private Component answerLine(WizardStepInspector.AnswerLine line) {
    return HorizontalLayout.builder()
        .spacing(false)
        .style("gap: 0.5rem; align-items: baseline;")
        .content(
            List.of(
                Text.builder()
                    .text(line.label() + ":")
                    .container(TextContainer.span)
                    .style(
                        "font-weight: 600; min-width: 8rem;"
                            + " color: var(--lumo-secondary-text-color);")
                    .build(),
                Text.builder().text(line.value()).container(TextContainer.span).build()))
        .build();
  }

  /**
   * One accordion panel per step: current open + editable, completed collapsed, upcoming disabled.
   */
  private Component accordionBody(HttpRequest httpRequest) {
    var steps = WizardStepInspector.getStepFields(this);
    var panels = new ArrayList<AccordionPanel>();
    for (int i = 0; i < steps.size(); i++) {
      if (!applies(i)) {
        continue;
      }
      boolean current = i == position;
      boolean upcoming = i > position;
      // Only the current (editable) and completed (read-only) steps render a form; upcoming steps
      // are just a disabled label so their empty fields don't pollute the state.
      var body =
          Div.builder()
              .style("width: 100%;")
              .children(
                  upcoming
                      ? List.<Component>of()
                      : stepForm(
                          WizardStepInspector.getValueOrClass(this, i), "", !current, httpRequest))
              .build();
      panels.add(
          AccordionPanel.builder()
              .label(getLabel(steps.get(i)))
              .content(body)
              .active(current)
              .disabled(upcoming)
              .build());
    }
    return AccordionLayout.builder().panels(panels).style("width: 100%;").build();
  }

  @SuppressWarnings("unchecked")
  private List<Component> stepForm(
      Object step, String prefix, boolean readOnly, HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    return new ArrayList<>(
        (Collection<Component>)
            getForm(
                prefix,
                step,
                "base_url",
                rq.route(),
                rq.consumedRoute(),
                rq.initiatorComponentId(),
                httpRequest,
                false,
                readOnly,
                getFormColumns(step.getClass()),
                0));
  }

  /**
   * Whether the step held by the given field applies, given the answers so far. Override to skip
   * steps conditionally (branching wizard) — e.g. only show the "company details" step when the
   * account type chosen in a previous step is COMPANY. Called every time the wizard renders or
   * navigates, so it can depend on values captured by earlier steps. The result (last) step always
   * applies.
   */
  protected boolean stepApplies(String stepFieldName) {
    return true;
  }

  /** Whether the step at the given index applies (the result step always does). */
  boolean applies(int index) {
    var steps = WizardStepInspector.getStepFields(this);
    if (index == steps.size() - 1) {
      return true;
    }
    return stepApplies(steps.get(index).getName());
  }

  /** How many steps apply given the answers so far. */
  int applicableSteps() {
    int count = 0;
    for (int i = 0; i < numberOfSteps(); i++) {
      if (applies(i)) {
        count++;
      }
    }
    return count;
  }

  /**
   * The next applicable non-result step after {@code from}, or -1 when there is none (meaning the
   * completion action is what comes next).
   */
  int nextApplicable(int from) {
    for (int i = from + 1; i < numberOfSteps() - 1; i++) {
      if (applies(i)) {
        return i;
      }
    }
    return -1;
  }

  /** The previous applicable step before {@code from} (0 at worst). */
  int previousApplicable(int from) {
    for (int i = from - 1; i > 0; i--) {
      if (applies(i)) {
        return i;
      }
    }
    return 0;
  }

  /** The current position expressed as an index over applicable steps only. */
  int applicablePosition() {
    int count = 0;
    for (int i = 0; i < position; i++) {
      if (applies(i)) {
        count++;
      }
    }
    return count;
  }

  public Object getStep() {
    return WizardStepInspector.getValueOrClass(this, position);
  }

  public int numberOfSteps() {
    return WizardStepInspector.numberOfSteps(this);
  }

  public int currentStepNumber() {
    return position;
  }

  public Field currentStepField() {
    return WizardStepInspector.currentStepField(this);
  }

  /**
   * The label of the built-in "Back" button: {@code @WizardLabels(back = …)} when set, "Back"
   * otherwise — either way through the app's {@code Translator} (messages bundle, request locale).
   * Override to decide it per request.
   */
  protected String backLabel(HttpRequest httpRequest) {
    var labels =
        io.mateu.core.infra.reflection.MetaAnnotations.find(getClass(), WizardLabels.class);
    return translate(
        labels != null && !labels.back().isBlank() ? labels.back() : "Back", httpRequest);
  }

  /**
   * The label of the built-in "Next" button: {@code @WizardLabels(next = …)} when set, "Next"
   * otherwise — either way through the app's {@code Translator}. Override to decide it per request.
   */
  protected String nextLabel(HttpRequest httpRequest) {
    var labels =
        io.mateu.core.infra.reflection.MetaAnnotations.find(getClass(), WizardLabels.class);
    return translate(
        labels != null && !labels.next().isBlank() ? labels.next() : "Next", httpRequest);
  }

  /**
   * A built-in text through the app's {@code Translator} bean for this request (the same i18n hook
   * as every other Mateu text), or the mapping's translator context when no bean is reachable.
   */
  static String translate(String text, HttpRequest httpRequest) {
    if (text == null || text.isBlank()) {
      return text;
    }
    Translator translator = null;
    if (httpRequest != null) {
      try {
        translator = MateuBeanProvider.getBean(Translator.class);
      } catch (RuntimeException ignored) {
        // no bean provider (e.g. a plain unit test): fall back to the translator context
      }
    }
    return translator != null
        ? translator.translate(text, httpRequest)
        : TranslatorContext.translate(text);
  }

  @Override
  public List<Validation> validations() {
    return WizardStepInspector.validations(this);
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<Action>();
    actions.add(Action.builder().id("next").validationRequired(true).build());
    // skipping and saving a draft deliberately leave the step incomplete: no client validation
    actions.add(Action.builder().id("skip").validationRequired(false).build());
    if (this instanceof Draftable) {
      actions.add(Action.builder().id("saveDraft").validationRequired(false).build());
      actions.add(Action.builder().id("saveAndClose").validationRequired(false).build());
    }
    // A completion action that streams (returns a Flux, e.g. a LongTask) has to be called over
    // SSE, or the client waits for the whole stream and the progress never shows.
    getAllMethods(getClass()).stream()
        .filter(method -> MetaAnnotations.isPresent(method, WizardCompletionAction.class))
        .filter(method -> Publisher.class.isAssignableFrom(method.getReturnType()))
        .map(
            method ->
                Action.builder().id(method.getName()).validationRequired(true).sse(true).build())
        .forEach(actions::add);
    return actions;
  }
}
