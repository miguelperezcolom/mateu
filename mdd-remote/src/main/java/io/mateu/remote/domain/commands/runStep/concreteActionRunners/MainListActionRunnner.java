package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.remote.domain.commands.runStep.ActionRunner;
import io.mateu.remote.domain.store.JourneyStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MainListActionRunnner implements ActionRunner {

    @Autowired
    JourneyStoreService store;

    @Autowired
    List<ListActionRunner> listActionRunners;

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

            for (ListActionRunner listActionRunner : listActionRunners) {
                if (listActionRunner.applies(crud, actionId)) {
                    listActionRunner.run(crud, journeyId, stepId, actionId, data);
                    break;
                }
            }

        }

    }

}