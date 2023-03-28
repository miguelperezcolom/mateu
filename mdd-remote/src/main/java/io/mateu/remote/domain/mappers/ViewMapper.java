package io.mateu.remote.domain.mappers;

import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.interfaces.RpcCrudViewExtended;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.metadata.CrudMetadataBuilder;
import io.mateu.remote.domain.metadata.FormMetadataBuilder;
import io.mateu.remote.domain.metadata.ResultMetadataBuilder;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.*;
import io.mateu.util.persistence.JPAHelper;

import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ViewMapper {
    public View map(JourneyContainer journeyContainer, String stepId, Object uiInstance) throws Throwable {
        //mddopencrudaction, crud class

        if (("view".equals(stepId) || "edit".equals(stepId)) && journeyContainer.getInitialStep() != null
                && "io.mateu.mdd.ui.cruds.JpaRpcCrudView".equals(journeyContainer.getInitialStep().getType())) { //todo: check si es un crud jpa
            RpcCrudViewExtended rpcCrudView = (RpcCrudViewExtended) JourneyStoreService.get()
                    .getViewInstance(journeyContainer.getJourneyId(), journeyContainer.getInitialStep().getId());
            uiInstance = JPAHelper.find(rpcCrudView.getEntityClass(), ReflectionHelper.getValue("id", uiInstance));
        } else if (uiInstance instanceof Class && RpcView.class.isAssignableFrom((Class<?>) uiInstance)) {
            uiInstance = ReflectionHelper.newInstance((Class) uiInstance);
        }


        ViewMetadata metadata = getMetadata(stepId, uiInstance);
        List<Component> components = new ArrayList<>();
        components.add(
                Component.builder()
                        .metadata(metadata)
                        .data(getData(uiInstance))
                        .rules(List.of())
                        .slot("main")
                        .attributes(new HashMap<>())
                        .build()
        );
        if (metadata instanceof Form) {
            addChildCruds(components, stepId, uiInstance);
        }

        int i = 0;
        for (Component component : components) {
            component.setId("component_" + i++);
        }

        View view = View.builder()
                .components(components)
                .build();

        return view;
    }

    private void addChildCruds(List<Component> components, String stepId, Object uiInstance) {
        if ("view".equals(stepId) || uiInstance instanceof ReadOnlyPojo) {
            List<Component> cruds = ReflectionHelper.getAllFields(uiInstance.getClass()).stream()
                    .filter(f -> RpcView.class.isAssignableFrom(f.getType()))
                    .map(f -> {
                        RpcView crud = null;
                        try {
                            crud = (RpcView) ReflectionHelper.getValue(f, uiInstance);
                            if (crud == null) {
                                crud = (RpcView) ReflectionHelper.newInstance(f.getType());
                            }
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        return new RpcViewWrapper(crud, f.getId());
                    })
                    .map(crud -> {
                        try {
                            return Component.builder()
                                    .metadata(getMetadata(stepId, crud))
                                    .data(getData(crud.getRpcView()))
                                    .rules(List.of())
                                    .slot("main")
                                    .attributes(new HashMap<>())
                                    .build();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                        return null;
                    })
                    .filter(c -> c != null)
                    .collect(Collectors.toList());
            components.addAll(cruds);
        }
    }

    public static Map<String, Object> getData(Object uiInstance) throws IOException {
        Map<String, Object> data = new HashMap<>();
        Class dataContainerClass = uiInstance.getClass();
        Object dataContainer = uiInstance;
        if (uiInstance instanceof RpcView) {
            return Map.of();
        }
        for (FieldInterfaced field : ReflectionHelper.getAllTransferrableFields(dataContainerClass)) {
            try {
                data.put(field.getId(), ReflectionHelper.getValue(field, dataContainer));
            } catch (Exception e) {
            }
        }
        return data;
    }

    private ViewMetadata getMetadata(String stepId, Object uiInstance) {
        ViewMetadata metadata;

        if (uiInstance instanceof io.mateu.mdd.shared.interfaces.JourneyStarter) {
            metadata = getJourneyStarter((io.mateu.mdd.shared.interfaces.JourneyStarter) uiInstance);
        } else if (uiInstance instanceof io.mateu.mdd.shared.interfaces.JourneyRunner) {
            metadata = getJourneyRunner((io.mateu.mdd.shared.interfaces.JourneyRunner) uiInstance);
        } else if (uiInstance instanceof Result) {
            metadata = getResult((Result) uiInstance);
        } else if (uiInstance instanceof RpcView) {
            metadata = getCrud(stepId, "main", (RpcView) uiInstance);
        } else if (uiInstance instanceof RpcViewWrapper) {
            metadata = getCrud(stepId, ((RpcViewWrapper) uiInstance).getId(), ((RpcViewWrapper) uiInstance).getRpcView());
        } else {
            metadata = getForm(stepId, uiInstance);
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

    private io.mateu.remote.dtos.Result getResult(Result uiInstance) {
        return new ResultMetadataBuilder().build(uiInstance);
    }

    private Form getForm(String stepId, Object uiInstance) {
        return new FormMetadataBuilder().build(stepId, uiInstance);
    }

    private Crud getCrud(String stepId, String listId, RpcView rpcView) {
        return new CrudMetadataBuilder().build(stepId, listId, rpcView);
    }


}
