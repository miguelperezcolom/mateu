package io.mateu.remote.domain.commands.runStep.concreteActionRunners.listActionRunners;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.EntityEditorFactory;
import io.mateu.remote.domain.commands.runStep.concreteActionRunners.ListActionRunner;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.util.Helper;
import jakarta.persistence.Entity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CrudEditActionRunner implements ListActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Crud crud, String actionId) {
        return "edit".equals(actionId);
    }

    @Override
    public void run(Crud crud, String journeyId, String stepId, String actionId
            , Map<String, Object> data, ServerHttpRequest serverHttpRequest)
            throws Throwable {

        Object row = data.get("_selectedRow");

        int __index = (Integer) data.getOrDefault("__index", -1);
        int __count = (Integer) data.getOrDefault("__count", -1);

        if (row == null && (__index == -1 && __count == -1)) {
            throw new Exception("No row selected");
        }

        if (row == null) {
            row = crud.fetchRows(null, null, (Integer) __index, 1).next().toFuture().get();
        }

        Object editor = null;
        try {
            editor = crud.getDetail(Helper.fromJson(Helper.toJson(row),
                    crud.getRowClass()));
        } catch (Throwable e) {
            throw new Exception("Crud onEdit thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }

        if (editor == null) {
            throw new Exception("Crud onEdit returned null");
        }

        if (editor.getClass().isAnnotationPresent(Entity.class)) {
            editor = ReflectionHelper.newInstance(EntityEditorFactory.class)
                    .create(editor, __index, __count);
        }

        String newStepId = "view";
        if (editor instanceof PersistentPojo) {
            newStepId = "edit";
        }
        store.setStep(journeyId, newStepId, editor, serverHttpRequest);

    }
}
