package io.mateu.remote.domain.mappers;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.JpaRpcCrudFactory;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.interfaces.RpcCrudViewExtended;
import io.mateu.mdd.shared.annotations.VisibleIf;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.RemoteJourney;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.metadata.CrudMetadataBuilder;
import io.mateu.remote.domain.metadata.FormMetadataBuilder;
import io.mateu.remote.domain.metadata.MethodParametersEditorMetadataBuilder;
import io.mateu.remote.domain.metadata.ResultMetadataBuilder;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.*;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.lang.reflect.InvocationTargetException;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ViewMapper {
    @PersistenceContext
    EntityManager em;

    @Autowired
    MateuRemoteClient mateuRemoteClient;

    @Autowired
    ApplicationContext applicationContext;

    //todo: became too long. Needs refactor
    public View map(JourneyContainer journeyContainer, String stepId, Object uiInstance) throws Throwable {
        //mddopencrudaction, crud class

        Object actualUiInstance = uiInstance;
        if (uiInstance instanceof EntityEditor) {
            EntityEditor entityEditor = (EntityEditor) uiInstance;
            actualUiInstance = em.find(entityEditor.getEntityClass(),
                    ReflectionHelper.getId(Helper.fromJson(Helper.toJson(entityEditor.getData()), entityEditor.getEntityClass())));
        } else if (uiInstance instanceof FieldEditor) {
            FieldEditor fieldEditor = (FieldEditor) uiInstance;
            actualUiInstance = Helper.fromJson(Helper.toJson(fieldEditor.getData()), fieldEditor.getType());
        } else if (uiInstance instanceof MethodParametersEditor) {
            MethodParametersEditor methodParametersEditor = (MethodParametersEditor) uiInstance;
            //actualUiInstance = Helper.fromJson(Helper.toJson(fieldEditor.getData()), fieldEditor.getType());
        } else if (("view".equals(stepId) || "edit".equals(stepId)) && journeyContainer.getInitialStep() != null
                && "io.mateu.mdd.ui.cruds.JpaRpcCrudView".equals(journeyContainer.getInitialStep().getType())) { //todo: check si es un crud jpa
            RpcCrudViewExtended rpcCrudView = (RpcCrudViewExtended) applicationContext.getBean(JourneyStoreService.class)
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
                        .rules(buildRules(metadata, actualUiInstance))
                        .slot("main")
                        .attributes(new HashMap<>())
                        .build()
        );
        if (metadata instanceof Form) {
            addChildCruds(components, stepId, uiInstance);
        }
        if (uiInstance instanceof FieldEditor) {
            addActionsForFieldEditor((Form) metadata, (FieldEditor) uiInstance);
        }
        if (uiInstance instanceof EntityEditor) {
            setIdAsReadOnlyIfEditing((Form) metadata, (EntityEditor) uiInstance);
        }


        int i = 0;
        for (Component component : components) {
            component.setId("component-" + i++);
            if (component.getMetadata() instanceof Crud) {
                Crud crud = (Crud) component.getMetadata();
                crud.getActions().forEach(action -> action.setId(component.getId() + "###" + action.getId()));
            }
            if (component.getMetadata() instanceof Form) {
                Form crud = (Form) component.getMetadata();
                crud.getActions().forEach(action -> action.setId(component.getId() + "###" + action.getId()));
                crud.getMainActions().forEach(action -> action.setId(component.getId() + "###" + action.getId()));
            }
        }

        View view = View.builder()
                .main(ViewPart.builder()
                        .components(components)
                        .build())
                .build();

        return view;
    }

    private void setIdAsReadOnlyIfEditing(Form metadata, EntityEditor uiInstance) {
        FieldInterfaced idField = ReflectionHelper.getIdField(uiInstance.getEntityClass());
        if (idField != null) {
            if (uiInstance.getData().containsKey(idField.getId())) {
                metadata.getSections().forEach(s -> s.getFieldGroups()
                        .forEach(g -> g.getLines()
                                .forEach(l -> l.getFields()
                                        .forEach(f -> {
                                            if (f.getId().equals(idField.getId())) {
                                                f.setStereotype("readonly");
                                            }
                                        }))));
            }
        }
    }

    private List<Rule> buildRules(ViewMetadata metadata, Object actualUiInstance) {
        List<Rule> rules = new ArrayList<>();
        if (metadata instanceof Form) {
            List<FieldInterfaced> allEditableFields = ReflectionHelper.getAllEditableFields(actualUiInstance.getClass());
            allEditableFields
                    .stream().filter(f -> f.isAnnotationPresent(VisibleIf.class))
                    .forEach(f -> rules.add(Rule.builder()
                            .filter("!(" + f.getAnnotation(VisibleIf.class).value() + ")")
                                    .data(new String[] {f.getId()})
                                    .action(RuleAction.Hide)
                    .build()));
        }
        return rules;
    }

    private void addActionsForFieldEditor(Form metadata, FieldEditor fieldEditor) {
        metadata.getMainActions().add(Action.builder()
                        .id("save")
                        .caption("Save")
                        .type(ActionType.Primary)
                        .validationRequired(true)
                .build());
    }

    private void addChildCruds(List<Component> components, String stepId, Object uiInstance) {
        if (uiInstance instanceof ReadOnlyPojo) {
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
        if (false && "view".equals(stepId) && uiInstance instanceof EntityEditor) {
            EntityEditor entityEditor = (EntityEditor) uiInstance;
            List<Component> cruds = ReflectionHelper.getAllFields(entityEditor.getEntityClass()).stream()
                    .filter(f -> f.isAnnotationPresent(OneToMany.class))
                    .map(f -> {
                        Listing crud = null;
                        try {
                            Object parentEntity = Serializer.fromMap(entityEditor.getData(), entityEditor.getEntityClass());
                            crud = ReflectionHelper.newInstance(JpaRpcCrudFactory.class).create(parentEntity, f);
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
        if (uiInstance instanceof FieldEditor) {
            Map<String, Object> data = new HashMap<>();
            data.putAll(((FieldEditor) uiInstance).getData());
            data.put("__type__", ((FieldEditor) uiInstance).getType().getName());
            data.put("__fieldId__", ((FieldEditor) uiInstance).getFieldId());
            data.put("__initialStep__", ((FieldEditor) uiInstance).getInitialStep());
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
        if (uiInstance instanceof FieldEditor) {
            data.putAll(((FieldEditor) uiInstance).getData());
            data.put("__type__", ((FieldEditor) uiInstance).getType().getName());
            data.put("__fieldId__", ((FieldEditor) uiInstance).getFieldId());
            data.put("__initialStep__", ((FieldEditor) uiInstance).getInitialStep());
        }
        Class dataContainerClass = uiInstance.getClass();
        Object dataContainer = uiInstance;
        if (uiInstance instanceof Listing) {
            return Map.of();
        }
        data.putAll(Serializer.toMap(uiInstance));
        ReflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
                .filter(f -> !ReflectionHelper.isBasico(f.getType()))
                .filter(f -> !f.getType().isArray())
                .filter(f -> !f.getType().isEnum())
                .filter(f -> !Collection.class.isAssignableFrom(f.getType()))
                .filter(f -> !Map.class.isAssignableFrom(f.getType()))
                .filter(f -> data.get(f.getId()) instanceof Map)
                .forEach(f -> {
                    try {
                        ((Map) data.get(f.getId()))
                                .put("__toString", "" + ReflectionHelper.getValue(f, uiInstance));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
        return data;
    }

    private ViewMetadata getMetadata(String stepId, Object uiInstance) {
        ViewMetadata metadata;

        if (uiInstance instanceof io.mateu.mdd.shared.interfaces.JourneyStarter) {
            metadata = getJourneyStarter((io.mateu.mdd.shared.interfaces.JourneyStarter) uiInstance);
        } else if (uiInstance instanceof io.mateu.mdd.shared.interfaces.JourneyRunner) {
            metadata = getJourneyRunner((io.mateu.mdd.shared.interfaces.JourneyRunner) uiInstance);
        } else if (uiInstance instanceof MethodParametersEditor) {
            metadata = getMethodParametersEditor(stepId, (MethodParametersEditor) uiInstance);
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

    private Form getMethodParametersEditor(String stepId, MethodParametersEditor uiInstance) {
        return new MethodParametersEditorMetadataBuilder().build(stepId, uiInstance);
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
