package io.mateu.remote.domain.modelToDtoMappers.viewMapperStuff;

import io.mateu.mdd.core.interfaces.Card;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.Stepper;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.metadataBuilders.*;
import io.mateu.remote.domain.modelToDtoMappers.RpcViewWrapper;
import io.mateu.remote.dtos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ViewMetadataBuilder {

    @Autowired
    FormMetadataBuilder formMetadataBuilder;

    @Autowired
    CardMetadataBuilder cardMetadataBuilder;

    @Autowired
    StepperMetadataBuilder stepperMetadataBuilder;

    @Autowired
    CrudMetadataBuilder crudMetadataBuilder;

    @Autowired
    ResultMetadataBuilder resultMetadataBuilder;

    @Autowired
    MethodParametersEditorMetadataBuilder methodParametersEditorMetadataBuilder;

    public ViewMetadata getMetadata(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
        ViewMetadata metadata;

        if (uiInstance instanceof io.mateu.mdd.shared.interfaces.JourneyStarter) {
            metadata = getJourneyStarter((io.mateu.mdd.shared.interfaces.JourneyStarter) uiInstance);
        } else if (uiInstance instanceof io.mateu.mdd.shared.interfaces.JourneyRunner) {
            metadata = getJourneyRunner((io.mateu.mdd.shared.interfaces.JourneyRunner) uiInstance);
        } else if (uiInstance instanceof MethodParametersEditor) {
            metadata = getMethodParametersEditor(stepId, (MethodParametersEditor) uiInstance);
        } else if (uiInstance instanceof Result) {
            metadata = getResult((Result) uiInstance);
        } else if (uiInstance instanceof Listing) {
            metadata = getCrud(stepId, "main", (Listing) uiInstance);
        } else if (uiInstance instanceof RpcViewWrapper) {
            metadata = getCrud(stepId, ((RpcViewWrapper) uiInstance).getId(), ((RpcViewWrapper) uiInstance).getRpcView());
        } else if (uiInstance instanceof Stepper) {
            metadata = getStepper(stepId, uiInstance, slotFields);
        } else if (uiInstance instanceof Card) {
            metadata = getCard(stepId, uiInstance, slotFields);
        } else if (uiInstance instanceof Stepper) {
            metadata = getStepper(stepId, uiInstance, slotFields);
        } else {
            metadata = getForm(stepId, uiInstance, slotFields);
        }

        if (uiInstance instanceof FieldEditor) {
            addActionsForFieldEditor((Form) metadata, (FieldEditor) uiInstance);
        }
        if (uiInstance instanceof EntityEditor) {
            setIdAsReadOnlyIfEditing((Form) metadata, (EntityEditor) uiInstance);
        }

        return metadata;
    }

    private JourneyRunner getJourneyRunner(io.mateu.mdd.shared.interfaces.JourneyRunner uiInstance) {
        return JourneyRunner.builder()
                .baseUrl(uiInstance.getBaseUrl())
                .journeyType(uiInstance.getJourneyType())
                .build();
    }

    private JourneyStarter getJourneyStarter(io.mateu.mdd.shared.interfaces.JourneyStarter uiInstance) {
        return JourneyStarter.builder()
                .baseUrl(uiInstance.getBaseUrl())
                .build();
    }

    private Form getMethodParametersEditor(String stepId, MethodParametersEditor uiInstance) {
        return methodParametersEditorMetadataBuilder.build(stepId, uiInstance);
    }

    private io.mateu.remote.dtos.Result getResult(Result uiInstance) {
        return resultMetadataBuilder.build(uiInstance);
    }

    private io.mateu.remote.dtos.Stepper getStepper(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
        return stepperMetadataBuilder.build(stepId, uiInstance, slotFields);
    }

    private io.mateu.remote.dtos.Card getCard(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
        return cardMetadataBuilder.build(stepId, uiInstance, slotFields);
    }

    private Form getForm(String stepId, Object uiInstance, List<FieldInterfaced> slotFields) {
        return formMetadataBuilder.build(stepId, uiInstance, slotFields);
    }

    private Crud getCrud(String stepId, String listId, Listing rpcView) {
        return crudMetadataBuilder.build(stepId, listId, rpcView);
    }


    private void setIdAsReadOnlyIfEditing(Form metadata, EntityEditor uiInstance) {
        FieldInterfaced idField = ReflectionHelper.getIdField(uiInstance.getEntityClass());
        if (idField != null) {
            if (uiInstance.getData().containsKey(idField.getId())) {
                metadata.getSections().forEach(s -> s.getFieldGroups()
                        .forEach(g -> g.getLines()
                                .forEach(l -> l.getFields()
                                        .forEach(f -> {
                                            if (f.getId().equals(idField.getId())) {
                                                f.setStereotype("readonly");
                                            }
                                        }))));
            }
        }
    }



    private void addActionsForFieldEditor(Form metadata, FieldEditor fieldEditor) {
        metadata.getMainActions().add(Action.builder()
                .id("save")
                .caption("Save")
                .type(ActionType.Primary)
                .validationRequired(true)
                .visible(true)
                .build());
    }

}
