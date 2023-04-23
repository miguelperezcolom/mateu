package io.mateu.remote.domain.commands.runStep.concreteActionRunners.listActionRunners;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.remote.domain.commands.runStep.concreteActionRunners.ListActionRunner;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.util.Helper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CrudDeleteActionRunner implements ListActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Crud crud, String actionId) {
        return "delete".equals(actionId);
    }

    @Override
    public void run(Crud crud, String journeyId, String stepId, String actionId, Map<String, Object> data)
            throws Throwable {
        List selectedRows = (List) data.get("_selectedRows");

        if (selectedRows == null) {
            throw new Exception("No row selected");
        }

        try {
            List<Object> targetSet = new ArrayList<>((Collection) selectedRows.stream().map(o -> (Map)o)
                    .map(m -> deserializeRow(m, crud))
                    .collect(Collectors.toList()));
            crud.delete(targetSet);

            Result whatToShow = new Result(ResultType.Success,
                    "" + selectedRows + " elements have been deleted", List.of(),
                    new Destination(DestinationType.ActionId, "Back to " +
                            store.getInitialStep(journeyId).getName(), store.getInitialStep(journeyId).getId()));
            String newStepId = "result_" + UUID.randomUUID().toString();
            store.setStep(journeyId, newStepId, whatToShow);

        } catch (Throwable e) {
            throw new Exception("Crud delete thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
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
