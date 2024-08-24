package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.editors.FieldEditor;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.annotations.HorizontalLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.SplitLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.VerticalLayout;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import io.mateu.core.domain.uidefinition.shared.elements.Element;
import io.mateu.core.domain.uidefinition.shared.interfaces.JpaCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.*;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

@Service
@Slf4j
public class ComponentMetadataBuilder {

  @Autowired JpaRpcCrudFactory jpaRpcCrudFactory;

  @Autowired FormMetadataBuilder formMetadataBuilder;

  @Autowired CardMetadataBuilder cardMetadataBuilder;

  @Autowired StepperMetadataBuilder stepperMetadataBuilder;

  @Autowired CrudMetadataBuilder crudMetadataBuilder;

  @Autowired ResultMetadataBuilder resultMetadataBuilder;

  @Autowired MethodParametersEditorMetadataBuilder methodParametersEditorMetadataBuilder;

  @Autowired ReflectionHelper reflectionHelper;
    @Autowired
    private DataExtractor dataExtractor;

  public ComponentMetadata getMetadata(
      boolean form, String stepId, Object componentInstance, Field field, List<Field> slotFields) {
    ComponentMetadata metadata;
    if (form) {
      metadata = getForm(stepId, componentInstance, slotFields);
    } else{
      if (componentInstance != null && componentInstance instanceof List<?> list && field != null
              && field.isAnnotationPresent(HorizontalLayout.class)) {
        metadata = getHorizontalLayout(list, stepId, componentInstance, field);
      } else if (componentInstance != null && componentInstance.getClass().isAnnotationPresent(HorizontalLayout.class)) {
          metadata = getHorizontalLayout(componentInstance, stepId);
      } else if (componentInstance != null && componentInstance.getClass().isAnnotationPresent(VerticalLayout.class)) {
        metadata = getVerticalLayout(componentInstance, stepId);
      } else if (componentInstance != null && componentInstance instanceof List<?> list && field != null
              && field.isAnnotationPresent(VerticalLayout.class)) {
        metadata = getVerticalLayout(list, stepId, componentInstance, field);
      } else if (componentInstance != null && componentInstance instanceof List<?> list && field != null
              && field.isAnnotationPresent(SplitLayout.class)) {
        metadata = getSplitLayout(list, stepId, componentInstance, field);
      } else if (componentInstance instanceof io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter) {
        metadata =
                getJourneyStarter((io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter) componentInstance);
      } else if (componentInstance instanceof Element) {
        metadata = getElement(stepId, (Element) componentInstance);
      } else if (componentInstance instanceof MethodParametersEditor) {
        metadata = getMethodParametersEditor(stepId, (MethodParametersEditor) componentInstance);
      } else if (componentInstance instanceof Result) {
        metadata = getResult((Result) componentInstance);
      } else if (componentInstance instanceof Listing) {
        metadata = getCrud(stepId, "main", (Listing) componentInstance);
      } else if (componentInstance instanceof RpcViewWrapper) {
        metadata =
                getCrud(stepId, ((RpcViewWrapper) componentInstance).getId(), ((RpcViewWrapper) componentInstance).getRpcView());
      } else if (componentInstance instanceof Stepper) {
        metadata = getStepper();
      } else if (componentInstance instanceof Card card) {
        metadata = getCard(stepId, card, slotFields);
      } else if (componentInstance instanceof JpaCrud) {
        metadata = getCrud(stepId, "main", (JpaCrud) componentInstance);
      } else {
        metadata = getNonForm(stepId, componentInstance, slotFields);
      }
    }

    if (componentInstance instanceof FieldEditor) {
      addActionsForFieldEditor((Form) metadata, (FieldEditor) componentInstance);
    }

    if (componentInstance instanceof EntityEditor && metadata instanceof Form) {
      setIdAsReadOnlyIfEditing((Form) metadata, (EntityEditor) componentInstance);
    }

    return metadata;
  }

  private ComponentMetadata getVerticalLayout(Object componentInstance, String stepId) {
    return new io.mateu.dtos.VerticalLayout();
  }

  private ComponentMetadata getHorizontalLayout(Object componentInstance, String stepId) {
    return new io.mateu.dtos.HorizontalLayout();
  }

  private ComponentMetadata getNonForm(String stepId, Object componentInstance, List<Field> slotFields) {
    if (componentInstance instanceof Container) {
      return new io.mateu.dtos.VerticalLayout();
    }
    return new io.mateu.dtos.Element("div", Map.of());
  }

  private ComponentMetadata getElement(String stepId, Element element) {
    return new io.mateu.dtos.Element(element.name(), element.attributes());
  }

  private ComponentMetadata getHorizontalLayout(List<?> list, String stepId, Object model, Field field) {
    return new io.mateu.dtos.HorizontalLayout();
  }

  private ComponentMetadata getVerticalLayout(List<?> list, String stepId, Object model, Field field) {
    return new io.mateu.dtos.VerticalLayout();
  }

  private ComponentMetadata getSplitLayout(List<?> list, String stepId, Object model, Field field) {
    if (list.size() > 2) {
      log.warn("Split layout cannot have more than 2 elements" + (field != null?" for field " + field.getName():""));
    }
    return new io.mateu.dtos.SplitLayout();
  }

  @SneakyThrows
  private ComponentMetadata getCrud(String stepId, String listId, JpaCrud crud) {
    Listing listing = jpaRpcCrudFactory.create(crud);
    return crudMetadataBuilder.build(stepId, listId, listing);
  }

  private JourneyStarter getJourneyStarter(
      io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter uiInstance) {
    return new JourneyStarter(uiInstance.baseUrl(), uiInstance.journeyTypeId());
  }

  private Form getMethodParametersEditor(String stepId, MethodParametersEditor uiInstance) {
    return methodParametersEditorMetadataBuilder.build(stepId, uiInstance);
  }

  private io.mateu.dtos.Result getResult(Result uiInstance) {
    return resultMetadataBuilder.build(uiInstance);
  }

  private io.mateu.dtos.Stepper getStepper() {
    return stepperMetadataBuilder.build();
  }

  private io.mateu.dtos.Card getCard(String stepId, Card uiInstance, List<Field> slotFields) {
    return cardMetadataBuilder.build(stepId, uiInstance, slotFields);
  }

  private Form getForm(String stepId, Object uiInstance, List<Field> slotFields) {
    return formMetadataBuilder.build(stepId, uiInstance, slotFields);
  }

  private Crud getCrud(String stepId, String listId, Listing rpcView) {
    return crudMetadataBuilder.build(stepId, listId, rpcView);
  }

  private Form setIdAsReadOnlyIfEditing(Form metadata, EntityEditor uiInstance) {
    Field idField = reflectionHelper.getIdField(uiInstance.getEntityClass());
    if (idField != null) {
      if (uiInstance.getData().containsKey(idField.getId())) {
        return new Form(
            metadata.icon(),
            metadata.title(),
            metadata.readOnly(),
            metadata.subtitle(),
            metadata.status(),
            metadata.badges(),
            metadata.tabs(),
            metadata.banners(),
            metadata.sections().stream()
                .map(
                    s ->
                        new Section(
                            s.id(),
                            s.tabId(),
                            s.caption(),
                            s.description(),
                            s.readOnly(),
                            s.type(),
                            s.leftSideImageUrl(),
                            s.topImageUrl(),
                            s.fieldGroups().stream()
                                .map(
                                    g ->
                                        new FieldGroup(
                                            g.id(),
                                            g.caption(),
                                            g.lines().stream()
                                                .map(
                                                    l ->
                                                        new FieldGroupLine(
                                                            l.fields().stream()
                                                                .map(
                                                                    f ->
                                                                        new io.mateu.dtos.Field(
                                                                            f.id(),
                                                                            f.type(),
                                                                            f.id()
                                                                                    .equals(
                                                                                        idField
                                                                                            .getId())
                                                                                ? "readonly"
                                                                                : f.stereotype(),
                                                                            f.observed(),
                                                                            f.caption(),
                                                                            f.placeholder(),
                                                                            f.cssClasses(),
                                                                            f.description(),
                                                                            f.badges(),
                                                                            f.validations(),
                                                                            f.attributes()))
                                                                .toList()))
                                                .toList()))
                                .toList()))
                .toList(),
            metadata.actions(),
            metadata.mainActions(),
            metadata.validations(),
            metadata.rules());
      }
    }
    return metadata;
  }

  private Form addActionsForFieldEditor(Form metadata, FieldEditor fieldEditor) {
    return new Form(
        metadata.icon(),
        metadata.title(),
        metadata.readOnly(),
        metadata.subtitle(),
        metadata.status(),
        metadata.badges(),
        metadata.tabs(),
        metadata.banners(),
        metadata.sections(),
        metadata.actions(),
        Stream.concat(
                metadata.mainActions().stream(),
                Stream.of(
                    new Action(
                        "save",
                        null,
                        "Save",
                        ActionType.Primary,
                        true,
                        true,
                        false,
                        false,
                        null,
                        ActionTarget.View,
                        null,
                        null,
                        null)))
            .toList(),
        metadata.validations(),
        metadata.rules());
  }
}
