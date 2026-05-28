package io.mateu.core.infra.declarative.orchestrators.wizard;

import static io.mateu.core.domain.out.componentmapper.FieldMetadataExtractor.getLabel;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper.getValidations;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.write.ValueWriter.setValue;

import io.mateu.core.domain.out.fragmentmapper.mappers.ValidationMapper;
import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public abstract class WizardOrchestrator
    implements ActionHandler,
        RouteHandler,
        ComponentTreeSupplier,
        StateSupplier,
        ValidationDtoSupplier,
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
    if (actionId.startsWith("search-")) {
      return WizardLookupHandler.handleSearch(actionId, this, httpRequest);
    }
    if ("next".equals(actionId)) {

      var stepField = currentStepField();
      setValue(
          stepField,
          this,
          MateuBeanProvider.getBean(InstanceFactory.class)
              .newInstance(
                  stepField.getType(), httpRequest.runActionRq().componentState(), httpRequest));

      position++;
    }
    if ("back".equals(actionId)) {
      position--;
    }
    if (!"".equals(actionId)) {
      var found =
          getAllMethods(getClass()).stream()
              .filter(method -> method.isAnnotationPresent(WizardCompletionAction.class))
              .filter(method -> actionId.equals(method.getName()))
              .findFirst();
      if (found.isPresent()) {

        var stepField = currentStepField();
        setValue(
            stepField,
            this,
            MateuBeanProvider.getBean(InstanceFactory.class)
                .newInstance(
                    stepField.getType(), httpRequest.runActionRq().componentState(), httpRequest));

        var method = found.get();
        if (!Modifier.isPublic(method.getModifiers())) {
          method.setAccessible(true);
        }
        var result = method.invoke(this);
        if (result != null) {
          return result;
        }
      }
    }
    return this;
  }

  @Override
  public Object handleRoute(String route, HttpRequest httpRequest) {
    return new Text("route was " + route);
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    var buttons = createButtons();
    return VerticalLayout.builder()
        .content(
            List.of(
                ProgressBar.builder()
                    .value(position + 1)
                    .max(numberOfSteps())
                    .text(getLabel(currentStepField()))
                    .style("width: 100%;")
                    .build(),
                getForm(
                        getStep(),
                        "base_url",
                        httpRequest.runActionRq().route(),
                        httpRequest.runActionRq().consumedRoute(),
                        httpRequest.runActionRq().initiatorComponentId(),
                        httpRequest,
                        false,
                        false,
                        getFormColumns(getStep().getClass()))
                    .iterator()
                    .next(),
                HorizontalLayout.builder()
                    .justification(HorizontalLayoutJustification.END)
                    .spacing(true)
                    .content(buttons)
                    .build()))
        .style("width: 100%")
        .build();
  }

  private List<Component> createButtons() {
    List<Component> buttons = new ArrayList<>();
    buttons.add(Button.builder().id("back").label("Back").disabled(position == 0).build());
    if (position < numberOfSteps() - 1) {
      buttons.add(
          Button.builder()
              .id("next")
              .label("Next")
              .disabled(position == numberOfSteps() - 1)
              .build());
    } else {
      getAllMethods(getClass()).stream()
          .filter(method -> method.isAnnotationPresent(WizardCompletionAction.class))
          .forEach(
              method ->
                  buttons.add(
                      Button.builder()
                          .label(getLabel(method))
                          .buttonStyle(ButtonStyle.primary)
                          .build()));
    }
    getAllMethods(currentStepField().getType()).stream()
        .filter(method -> method.isAnnotationPresent(Toolbar.class))
        .forEach(
            method ->
                buttons.add(
                    Button.builder().actionId(method.getName()).label(getLabel(method)).build()));
    return buttons;
  }

  public Object getStep() {
    return getValueOrClass(position);
  }

  private Object getValueOrClass(int position) {
    var steps = getStepFields();
    var field = steps.get(position);
    var value = getValue(field, this);
    if (value != null) {
      return value;
    }
    return field.getType();
  }

  private List<Field> getStepFields() {
    return getAllFields(this.getClass()).stream()
        .filter(field -> WizardStep.class.isAssignableFrom(field.getType()))
        .toList();
  }

  public int numberOfSteps() {
    return getStepFields().size();
  }

  public int currentStepNumber() {
    return position;
  }

  public Field currentStepField() {
    return getStepFields().get(position);
  }

  @Override
  public List<ValidationDto> validationDtos() {
    List<ValidationDto> fieldLevelValidations = new ArrayList<>();
    var stepClass = getStepFields().get(currentStepNumber()).getType();
    getAllFields(stepClass).stream()
        .flatMap(field -> getValidations(field).stream())
        .filter(Objects::nonNull)
        .forEach(fieldLevelValidations::add);
    return Stream.concat(
            fieldLevelValidations.stream(),
            Arrays.stream(
                    stepClass.getAnnotationsByType(io.mateu.uidl.annotations.Validation.class))
                .map(ValidationMapper::mapToValidation))
        .toList();
  }

  @Override
  public List<Action> actions(HttpRequest httpRequest) {
    var actions = new ArrayList<Action>();
    actions.add(Action.builder().id("next").validationRequired(true).build());
    return actions;
  }
}
