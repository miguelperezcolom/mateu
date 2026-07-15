package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.domain.out.componentmapper.ReflectionPageMapper.getTitle;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.uidl.annotations.WizardLayoutMode;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

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

  @SneakyThrows
  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    return WizardActionDispatcher.dispatch(actionId, this, httpRequest);
  }

  @Override
  public Object handleRoute(String route, HttpRequest httpRequest) {
    return this;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    var content = new ArrayList<Component>();
    content.add(
        Text.builder()
            .text(getTitle(this))
            .container(TextContainer.h2)
            .style("margin: 0;")
            .build());
    content.add(progressIndicator());

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

    return VerticalLayout.builder().content(content).style("width: 100%").build();
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
  private Component progressIndicator() {
    if (progressStyle() == io.mateu.uidl.annotations.WizardProgressStyle.STEPS) {
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
      return ProgressSteps.builder().steps(items).style("width: 100%;").build();
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
            .text("Previous answers")
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

  @Override
  public List<Validation> validations() {
    return WizardStepInspector.validations(this);
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<Action>();
    actions.add(Action.builder().id("next").validationRequired(true).build());
    return actions;
  }
}
