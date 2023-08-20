package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.util.Helper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EntityEditorEditActionRunner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return viewInstance instanceof EntityEditor && "edit".equals(actionId);
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId
            , Map<String, Object> data, ServerHttpRequest serverHttpRequest) throws Throwable {
        store.setStep(journeyId, "edit", getEditor((EntityEditor) viewInstance), serverHttpRequest);
    }

    private Object getEditor(EntityEditor entityEditor) throws Exception {
        Object pojo = Helper.fromJson(Helper.toJson(entityEditor.getData()), entityEditor.getEntityClass());
        return pojo;
    }

}
