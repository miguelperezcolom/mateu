package io.mateu.core.domain.model.outbound.metadataBuilders;

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
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
  @Autowired private DataExtractor dataExtractor;

  public ComponentMetadata getMetadata(
      boolean form, Object componentInstance, Field field, List<Field> slotFields) {
    ComponentMetadata metadata;
    if (form) {
      metadata = getForm(componentInstance, slotFields);
    } else {
      if (componentInstance != null
          && componentInstance instanceof List<?> list
          && field != null
          && field.isAnnotationPresent(HorizontalLayout.class)) {
        metadata = getHorizontalLayout(list, componentInstance, field);
      } else if (componentInstance != null
          && componentInstance.getClass().isAnnotationPresent(HorizontalLayout.class)) {
        metadata = getHorizontalLayout(componentInstance);
      } else if (componentInstance != null
          && componentInstance.getClass().isAnnotationPresent(VerticalLayout.class)) {
        metadata = getVerticalLayout(componentInstance);
      } else if (componentInstance != null
          && componentInstance instanceof List<?> list
          && field != null
          && field.isAnnotationPresent(VerticalLayout.class)) {
        metadata = getVerticalLayout(list, componentInstance, field);
      } else if (componentInstance != null
          && componentInstance instanceof List<?> list
          && field != null
          && field.isAnnotationPresent(SplitLayout.class)) {
        metadata = getSplitLayout(list, componentInstance, field);
      } else if (componentInstance
          instanceof io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter) {
        metadata =
            getJourneyStarter(
                (io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter)
                    componentInstance);
      } else if (componentInstance instanceof Element) {
        metadata = getElement((Element) componentInstance);
      } else if (componentInstance instanceof MethodParametersEditor) {
        metadata = getMethodParametersEditor((MethodParametersEditor) componentInstance);
      } else if (componentInstance instanceof Result) {
        metadata = getResult((Result) componentInstance);
      } else if (componentInstance instanceof Listing) {
        metadata = getCrud("main", (Listing) componentInstance);
      } else if (componentInstance instanceof RpcViewWrapper) {
        metadata =
            getCrud(
                ((RpcViewWrapper) componentInstance).getId(),
                ((RpcViewWrapper) componentInstance).getRpcView());
      } else if (componentInstance instanceof Stepper) {
        metadata = getStepper();
      } else if (componentInstance instanceof Card card) {
        metadata = getCard(card, slotFields);
      } else if (componentInstance instanceof JpaCrud) {
        metadata = getCrud("main", (JpaCrud) componentInstance);
      } else {
        metadata = getNonForm(componentInstance, slotFields);
      }
    }

    return metadata;
  }

  private ComponentMetadata getVerticalLayout(Object componentInstance) {
    return new io.mateu.dtos.VerticalLayout();
  }

  private ComponentMetadata getHorizontalLayout(Object componentInstance) {
    return new io.mateu.dtos.HorizontalLayout();
  }

  private ComponentMetadata getNonForm(Object componentInstance, List<Field> slotFields) {
    if (componentInstance instanceof Container) {
      return new io.mateu.dtos.VerticalLayout();
    }
    return new io.mateu.dtos.Element("div", Map.of());
  }

  private ComponentMetadata getElement(Element element) {
    return new io.mateu.dtos.Element(element.name(), element.attributes());
  }

  private ComponentMetadata getHorizontalLayout(List<?> list, Object model, Field field) {
    return new io.mateu.dtos.HorizontalLayout();
  }

  private ComponentMetadata getVerticalLayout(List<?> list, Object model, Field field) {
    return new io.mateu.dtos.VerticalLayout();
  }

  private ComponentMetadata getSplitLayout(List<?> list, Object model, Field field) {
    if (list.size() > 2) {
      log.warn(
          "Split layout cannot have more than 2 elements"
              + (field != null ? " for field " + field.getName() : ""));
    }
    return new io.mateu.dtos.SplitLayout();
  }

  @SneakyThrows
  private ComponentMetadata getCrud(String listId, JpaCrud crud) {
    Listing listing = jpaRpcCrudFactory.create(crud);
    return crudMetadataBuilder.build(listId, listing);
  }

  private JourneyStarter getJourneyStarter(
      io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter uiInstance) {
    return new JourneyStarter(uiInstance.baseUrl(), uiInstance.journeyTypeId());
  }

  private Form getMethodParametersEditor(MethodParametersEditor uiInstance) {
    return methodParametersEditorMetadataBuilder.build(uiInstance);
  }

  private io.mateu.dtos.Result getResult(Result uiInstance) {
    return resultMetadataBuilder.build(uiInstance);
  }

  private io.mateu.dtos.Stepper getStepper() {
    return stepperMetadataBuilder.build();
  }

  private io.mateu.dtos.Card getCard(Card uiInstance, List<Field> slotFields) {
    return cardMetadataBuilder.build(uiInstance, slotFields);
  }

  private Form getForm(Object uiInstance, List<Field> slotFields) {
    return formMetadataBuilder.build(uiInstance, slotFields);
  }

  private Crud getCrud(String listId, Listing rpcView) {
    return crudMetadataBuilder.build(listId, rpcView);
  }

  public ComponentMetadata getFormMetadata(Object form) {
    return getMetadata(true, form, null, reflectionHelper.getAllEditableFields(form.getClass()));
  }
}