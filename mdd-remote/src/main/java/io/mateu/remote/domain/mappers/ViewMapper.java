package io.mateu.remote.domain.mappers;

import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.interfaces.RpcCrudViewExtended;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.metadata.CrudMetadataBuilder;
import io.mateu.remote.domain.metadata.FormMetadataBuilder;
import io.mateu.remote.domain.metadata.ResultMetadataBuilder;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.*;
import io.mateu.util.Serializer;
import org.springframework.stereotype.Service;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ViewMapper {
    @PersistenceContext
    EntityManager em;

    public View map(JourneyContainer journeyContainer, String stepId, Object uiInstance) throws Throwable {
        //mddopencrudaction, crud class

        Object actualUiInstance = uiInstance;
        if (uiInstance instanceof EntityEditor) {
            actualUiInstance = em.find(((EntityEditor) uiInstance).getEntityClass(), ((EntityEditor)uiInstance).getData().get("id"));
        } else if (("view".equals(stepId) || "edit".equals(stepId)) && journeyContainer.getInitialStep() != null
                && "io.mateu.mdd.ui.cruds.JpaRpcCrudView".equals(journeyContainer.getInitialStep().getType())) { //todo: check si es un crud jpa
            RpcCrudViewExtended rpcCrudView = (RpcCrudViewExtended) JourneyStoreService.get()
                    .getViewInstance(journeyContainer.getJourneyId(), journeyContainer.getInitialStep().getId());
            actualUiInstance = em.find(rpcCrudView.getEntityClass(), ((EntityEditor)uiInstance).getData().get("id"));
        } else if (uiInstance instanceof Class && Listing.class.isAssignableFrom((Class<?>) uiInstance)) {
            actualUiInstance = ReflectionHelper.newInstance((Class) uiInstance);
        }


        ViewMetadata metadata = getMetadata(stepId, actualUiInstance);
        List<Component> components = new ArrayList<>();
        components.add(
                Component.builder()
                        .metadata(metadata)
                        .data(getData(uiInstance, actualUiInstance))
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
                    .filter(f -> Listing.class.isAssignableFrom(f.getType()))
                    .map(f -> {
                        Listing crud = null;
                        try {
                            crud = (Listing) ReflectionHelper.getValue(f, uiInstance);
                            if (crud == null) {
                                crud = (Listing) ReflectionHelper.newInstance(f.getType());
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
                                    .data(getData(null, crud.getRpcView()))
                                    .rules(List.of())
                                    .slot("main")
                                    .attributes(new HashMap<>())
                                    .build();
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
                        return null;
                    })
                    .filter(c -> c != null)
                    .collect(Collectors.toList());
            components.addAll(cruds);
        }
    }

    public static Map<String, Object> getData(Object uiInstance, Object actualUiInstance) throws Exception {
        if (uiInstance instanceof EntityEditor) {
            Map<String, Object> data = new HashMap<>();
            data.putAll(((EntityEditor) uiInstance).getData());
            data.put("__entityClassName__", ((EntityEditor) uiInstance).getEntityClass().getName());
            return data;
        }
        return getData(actualUiInstance);
    }

    public static Map<String, Object> getData(Object uiInstance) throws Exception {
        Map<String, Object> data = new HashMap<>();
        if (uiInstance instanceof EntityEditor) {
            data.putAll(((EntityEditor) uiInstance).getData());
            data.put("__entityClassName__", ((EntityEditor) uiInstance).getEntityClass().getName());
        }
        Class dataContainerClass = uiInstance.getClass();
        Object dataContainer = uiInstance;
        if (uiInstance instanceof Listing) {
            return Map.of();
        }
        data = Serializer.toMap(uiInstance);
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
        } else if (uiInstance instanceof Listing) {
            metadata = getCrud(stepId, "main", (Listing) uiInstance);
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

    private Crud getCrud(String stepId, String listId, Listing rpcView) {
        return new CrudMetadataBuilder().build(stepId, listId, rpcView);
    }


}
