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
    content.add(
        ProgressBar.builder()
            .value(position == numberOfSteps() - 1 ? numberOfSteps() : position)
            .max(numberOfSteps())
            .text(getLabel(currentStepField()))
            .style("width: 100%;")
            .build());

    switch (layoutMode()) {
      case ACCORDION -> content.add(accordionBody(httpRequest));
      case ACCUMULATIVE -> {
        // Read-only recap of every completed step, then the current (editable) step below it.
        for (int i = 0; i < position; i++) {
          content.add(recapCard(i, httpRequest));
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
   * A completed step rendered read-only. The step fields read their values from the (flattened)
   * wizard state — the same way the live step does — so previously entered data shows up.
   */
  private Component recapCard(int stepIndex, HttpRequest httpRequest) {
    var step = WizardStepInspector.getValueOrClass(this, stepIndex);
    var label = getLabel(WizardStepInspector.getStepFields(this).get(stepIndex));
    var body =
        Div.builder().style("width: 100%;").children(stepForm(step, "", true, httpRequest)).build();
    return Card.builder()
        .variants(List.of(CardVariant.outlined))
        .style("width: 100%;")
        .content(
            VerticalLayout.builder()
                .content(
                    List.of(
                        Text.builder()
                            .text(label)
                            .container(TextContainer.h4)
                            .style("margin: 0 0 0.25rem 0;")
                            .build(),
                        body))
                .build())
        .build();
  }

  /**
   * One accordion panel per step: current open + editable, completed collapsed, upcoming disabled.
   */
  private Component accordionBody(HttpRequest httpRequest) {
    var steps = WizardStepInspector.getStepFields(this);
    var panels = new ArrayList<AccordionPanel>();
    for (int i = 0; i < steps.size(); i++) {
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
