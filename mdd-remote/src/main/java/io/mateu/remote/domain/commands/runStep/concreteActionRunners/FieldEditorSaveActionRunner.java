package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.persistence.Merger;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FieldEditorSaveActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance instanceof FieldEditor && "save".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable{
        FieldEditor fieldEditor = (FieldEditor) viewInstance;

        Step initialStep = store.getStep(journeyId, fieldEditor.getInitialStep());

        io.mateu.remote.dtos.Component form = initialStep.getView().getMain().getComponents().get(0);

        Object object = Helper.fromJson(Helper.toJson(data), fieldEditor.getType());
        data = Serializer.toMap(object);
        data.put("__toString", "" + object);

        form.getData().put(fieldEditor.getFieldId(), data);

        store.backToStep(journeyId, initialStep.getId()); // will save the step
    }
}
