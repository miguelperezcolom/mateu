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
    public void run(Crud crud, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable {

        Object row = data.get("_selectedRow");

        if (row == null) {
            throw new Exception("No row selected");
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
                    .create(editor);
        }

        String newStepId = "view";
        if (editor instanceof PersistentPojo) {
            newStepId = "edit";
        }
        store.setStep(journeyId, newStepId, editor);

    }
}
