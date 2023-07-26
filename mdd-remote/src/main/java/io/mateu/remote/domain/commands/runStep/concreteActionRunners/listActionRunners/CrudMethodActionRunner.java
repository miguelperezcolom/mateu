package io.mateu.remote.domain.commands.runStep.concreteActionRunners.listActionRunners;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.core.interfaces.HasActions;
import io.mateu.mdd.shared.interfaces.SelectedRowsContext;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.concreteActionRunners.ListActionRunner;
import io.mateu.remote.domain.commands.runStep.concreteActionRunners.RunMethodActionRunner;
import io.mateu.remote.domain.store.JourneyStoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CrudMethodActionRunner extends RunMethodActionRunner implements ListActionRunner {

    @Autowired
    JourneyStoreService store;

    @Override
    public boolean applies(Crud crud, String actionId) {
        List<Method> allMethods = ReflectionHelper.getAllMethods(crud.getClass()).stream()
                .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
                .collect(Collectors.toList());
        if (crud instanceof HasActions) {
            allMethods.addAll(((HasActions) crud).getActionMethods());
        }
        return allMethods.stream().map(m -> m.getName()).collect(Collectors.toList()).contains(actionId);
    }

    @Override
    public void run(Crud crud, String journeyId, String stepId, String listId, String actionId
            , Map<String, Object> data, ServerHttpRequest serverHttpRequest)
            throws Throwable {

        List selectedRows = (List) data.get("_selectedRows");
        List<Object> targetSet = new ArrayList<>((Collection) selectedRows.stream()
                .map(m -> {
                    try {
                        return crud.getRow((Map<String, Object>) m);
                    } catch (Throwable e) {
                        e.printStackTrace();
                    }
                    return null;
                })
                .collect(Collectors.toList()));

        new SelectedRowsContext(targetSet);

        try {

            List<Method> allMethods = ReflectionHelper.getAllMethods(crud.getClass()).stream()
                    .filter(m -> m.isAnnotationPresent(io.mateu.mdd.shared.annotations.Action.class))
                    .collect(Collectors.toList());
            if (crud instanceof HasActions) {
                allMethods.addAll(((HasActions) crud).getActionMethods());
            }

            Method method = allMethods.stream().filter(m -> actionId.equals(m.getName())).findAny().get();

            runMethod(getInstance(crud, method), method, journeyId, stepId, actionId, data, serverHttpRequest);

        } catch (Throwable e) {
            throw new Exception("Crud " + actionId + " thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
        }

    }

    private Object getInstance(Crud crud, Method method) {
        if (Modifier.isStatic(method.getModifiers())) {
            return null;
        }
        return crud;
    }
}
