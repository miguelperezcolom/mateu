package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.core.domain.model.editors.FieldEditor;
import io.mateu.core.domain.model.editors.MethodParametersEditor;
import io.mateu.core.domain.model.reflection.FieldInterfaced;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import io.mateu.core.domain.uidefinition.shared.interfaces.JpaCrud;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.*;
import java.util.List;
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
      String stepId, Object uiInstance, Object model, List<FieldInterfaced> slotFields) {
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
      metadata = getCard(stepId, model, slotFields);
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
      String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
    return stepperMetadataBuilder.build(stepId, uiInstance, slotFields);
  }

  private io.mateu.dtos.Card getCard(
      String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
    return cardMetadataBuilder.build(stepId, uiInstance, slotFields);
  }

  private Form getForm(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
    return formMetadataBuilder.build(stepId, uiInstance, slotFields);
  }

  private Crud getCrud(String stepId, String listId, Listing rpcView) {
    return crudMetadataBuilder.build(stepId, listId, rpcView);
  }

  private void setIdAsReadOnlyIfEditing(Form metadata, EntityEditor uiInstance) {
    FieldInterfaced idField = reflectionHelper.getIdField(uiInstance.getEntityClass());
    if (idField != null) {
      if (uiInstance.getData().containsKey(idField.getId())) {
        metadata
            .getSections()
            .forEach(
                s ->
                    s.getFieldGroups()
                        .forEach(
                            g ->
                                g.getLines()
                                    .forEach(
                                        l ->
                                            l.getFields()
                                                .forEach(
                                                    f -> {
                                                      if (f.getId().equals(idField.getId())) {
                                                        f.setStereotype("readonly");
                                                      }
                                                    }))));
      }
    }
  }

  private void addActionsForFieldEditor(Form metadata, FieldEditor fieldEditor) {
    metadata
        .getMainActions()
        .add(
            Action.builder()
                .id("save")
                .caption("Save")
                .type(ActionType.Primary)
                .validationRequired(true)
                .visible(true)
                .build());
  }
}
