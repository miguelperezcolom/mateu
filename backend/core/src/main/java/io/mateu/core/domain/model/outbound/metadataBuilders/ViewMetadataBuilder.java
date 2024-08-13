package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.editors.FieldEditor;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import io.mateu.core.domain.uidefinition.shared.interfaces.JpaCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.*;
import java.util.List;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ViewMetadataBuilder {

  @Autowired JpaRpcCrudFactory jpaRpcCrudFactory;

  @Autowired FormMetadataBuilder formMetadataBuilder;

  @Autowired CardMetadataBuilder cardMetadataBuilder;

  @Autowired StepperMetadataBuilder stepperMetadataBuilder;

  @Autowired CrudMetadataBuilder crudMetadataBuilder;

  @Autowired ResultMetadataBuilder resultMetadataBuilder;

  @Autowired MethodParametersEditorMetadataBuilder methodParametersEditorMetadataBuilder;

  @Autowired ReflectionHelper reflectionHelper;

  public ViewMetadata getMetadata(
      String dataPrefix, String stepId, Object uiInstance, Object model, List<Field> slotFields) {
    ViewMetadata metadata;

    if (uiInstance instanceof io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter) {
      metadata =
          getJourneyStarter(
              (io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter) uiInstance);
    } else if (uiInstance
        instanceof io.mateu.core.domain.uidefinition.shared.interfaces.JourneyRunner) {
      metadata =
          getJourneyRunner(
              (io.mateu.core.domain.uidefinition.shared.interfaces.JourneyRunner) uiInstance);
    } else if (uiInstance instanceof MethodParametersEditor) {
      metadata = getMethodParametersEditor(stepId, (MethodParametersEditor) uiInstance);
    } else if (uiInstance instanceof Result) {
      metadata = getResult((Result) uiInstance);
    } else if (uiInstance instanceof Listing) {
      metadata = getCrud(stepId, "main", (Listing) uiInstance);
    } else if (model instanceof RpcViewWrapper) {
      metadata =
          getCrud(stepId, ((RpcViewWrapper) model).getId(), ((RpcViewWrapper) model).getRpcView());
    } else if (model instanceof Stepper) {
      metadata = getStepper(stepId, model, slotFields);
    } else if (model instanceof Card) {
      metadata = getCard(dataPrefix, stepId, model, slotFields);
    } else if (model instanceof JpaCrud) {
      metadata = getCrud(stepId, "main", (JpaCrud) model);
    } else {
      metadata = getForm(stepId, model, slotFields);
    }

    if (uiInstance instanceof FieldEditor) {
      addActionsForFieldEditor((Form) metadata, (FieldEditor) uiInstance);
    }

    if (uiInstance instanceof EntityEditor && metadata instanceof Form) {
      setIdAsReadOnlyIfEditing((Form) metadata, (EntityEditor) uiInstance);
    }

    return metadata;
  }

  @SneakyThrows
  private ViewMetadata getCrud(String stepId, String listId, JpaCrud crud) {
    Listing listing = jpaRpcCrudFactory.create(crud);
    return crudMetadataBuilder.build(stepId, listId, listing);
  }

  private JourneyRunner getJourneyRunner(
      io.mateu.core.domain.uidefinition.shared.interfaces.JourneyRunner uiInstance) {
    return JourneyRunner.builder()
        .baseUrl(uiInstance.getBaseUrl())
        .journeyType(uiInstance.getJourneyType())
        .build();
  }

  private JourneyStarter getJourneyStarter(
      io.mateu.core.domain.uidefinition.shared.interfaces.JourneyStarter uiInstance) {
    return JourneyStarter.builder().baseUrl(uiInstance.getBaseUrl()).build();
  }

  private Form getMethodParametersEditor(String stepId, MethodParametersEditor uiInstance) {
    return methodParametersEditorMetadataBuilder.build(stepId, uiInstance);
  }

  private io.mateu.dtos.Result getResult(Result uiInstance) {
    return resultMetadataBuilder.build(uiInstance);
  }

  private io.mateu.dtos.Stepper getStepper(
      String stepId, Object uiInstance, List<Field> slotFields) {
    return stepperMetadataBuilder.build(stepId, uiInstance, slotFields);
  }

  private io.mateu.dtos.Card getCard(
      String dataPrefix, String stepId, Object uiInstance, List<Field> slotFields) {
    return cardMetadataBuilder.build(dataPrefix, stepId, uiInstance, slotFields);
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
            metadata.dataPrefix(),
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
                            s.actions(),
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
            metadata.validations());
      }
    }
    return metadata;
  }

  private Form addActionsForFieldEditor(Form metadata, FieldEditor fieldEditor) {
    return new Form(
        metadata.dataPrefix(),
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
                        "Save",
                        ActionType.Primary,
                        true,
                        true,
                        false,
                        false,
                        null,
                        ActionTarget.SameLane,
                        null,
                        null,
                        null)))
            .toList(),
        metadata.validations());
  }
}
