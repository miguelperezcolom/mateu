package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class WizardOrchestrator
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
    var buttons = WizardButtonBuilder.createButtons(this);
    return VerticalLayout.builder()
        .content(
            List.of(
                ProgressBar.builder()
                    .value(position + 1)
                    .max(numberOfSteps())
                    .text(getLabel(currentStepField()))
                    .style("width: 100%;")
                    .build(),
                Div.builder()
                    .style("width: 100%;")
                    .children(
                        (List<Component>)
                            getForm(
                                getStep(),
                                "base_url",
                                httpRequest.runActionRq().route(),
                                httpRequest.runActionRq().consumedRoute(),
                                httpRequest.runActionRq().initiatorComponentId(),
                                httpRequest,
                                false,
                                false,
                                getFormColumns(getStep().getClass()),
                                0))
                    .build(),
                HorizontalLayout.builder()
                    .justification(HorizontalLayoutJustification.END)
                    .spacing(true)
                    .content(buttons)
                    .build()))
        .style("width: 100%")
        .build();
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
