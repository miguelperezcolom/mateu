package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.EntityEditorFactory;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.util.Helper;
import jakarta.persistence.Entity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ListActionRunnner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Object viewInstance, String actionId) {
        return actionId.startsWith("__list__");
    }

    @Override
    public void run(Object viewInstance, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable{

        Listing rpcView;
        if (viewInstance instanceof Listing) {
            rpcView = (Listing) viewInstance;
        } else {
            String listId = actionId.split("__")[2];
            rpcView = store.getRpcViewInstance(journeyId, stepId, listId);
        }
        actionId = actionId.substring(actionId.indexOf("__") + 2);
        actionId = actionId.substring(actionId.indexOf("__") + 2);
        actionId = actionId.substring(actionId.indexOf("__") + 2);
        if (rpcView instanceof Crud) {
            Crud crud = (Crud) rpcView;
            if ("new".equals(actionId)) {

                Object editor = null;
                try {
                    editor = crud.getNewRecordForm();
                } catch (Throwable e) {
                    throw new Exception("Crud onNew thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
                }

                if (editor == null) {
                    throw new Exception("Crud onNew and onEdit returned null");
                }

                String newStepId = "new_" + UUID.randomUUID().toString();
                store.setStep(journeyId, newStepId, editor);

            } else if ("delete".equals(actionId)) {

                List selectedRows = (List) data.get("_selectedRows");

                if (selectedRows == null) {
                    throw new Exception("No row selected");
                }

                try {
                    List<Object> targetSet = new ArrayList<>((Collection) selectedRows.stream().map(o -> (Map)o)
                            .map(m -> deserializeRow(m, rpcView))
                            .collect(Collectors.toList()));
                    crud.delete(targetSet);

                    boolean isCrud = store.isCrud(journeyId);

                    Result whatToShow = new Result(ResultType.Success,
                            "" + selectedRows + " elements have been deleted", List.of(),
                            new Destination(DestinationType.ActionId, "Back to " +
                                    store.getInitialStep(journeyId).getName(), store.getInitialStep(journeyId).getId()));
                    String newStepId = "result_" + UUID.randomUUID().toString();
                    store.setStep(journeyId, newStepId, whatToShow);

                } catch (Throwable e) {
                    throw new Exception("Crud delete thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
                }

            } else if ("edit".equals(actionId)) {

                Object row = data.get("_selectedRow");

                if (row == null) {
                    throw new Exception("No row selected");
                }

                Object editor = null;
                try {
                    editor = crud.getDetail(Helper.fromJson(Helper.toJson(row),
                            rpcView.getRowClass()));
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

            } else if (actionId.startsWith("row__")) {

                Object row = data.get("_clickedRow");

                if (row == null) {
                    throw new Exception("No row clicked");
                }

                String methodName = actionId.replaceAll("row__", "");
                try {

                    Method method = rpcView.getClass().getMethod(methodName, ((Crud) rpcView).getRowClass());

                    method.invoke(rpcView, Helper.fromJson(Helper.toJson(row),
                            ((Crud) rpcView).getRowClass()));
                } catch (Throwable e) {
                    throw new Exception("Crud " + methodName + " thrown " +
                            e.getClass().getSimpleName() + ": " + e.getMessage());
                }

            }

        }


    }

    private Object deserializeRow(Object m, Listing viewInstance) {
        try {
            return Helper.fromJson(Helper.toJson(m), viewInstance.getRowClass());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

}
