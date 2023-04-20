package io.mateu.remote.domain.commands.runStep;

import com.google.common.base.Strings;
import io.mateu.mdd.core.interfaces.*;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.File;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.*;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.MateuRemoteClient;
import io.mateu.remote.domain.commands.EntityEditorFactory;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.editors.MethodParametersEditor;
import io.mateu.remote.domain.files.StorageServiceAccessor;
import io.mateu.remote.domain.persistence.Merger;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import jakarta.persistence.Entity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import javax.naming.AuthenticationException;
import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RunStepActionCommandHandler {

    @Autowired
    JourneyStoreService store;

    @Autowired
    MateuRemoteClient mateuRemoteClient;

    @Transactional
    public Mono<Void> handle(RunStepActionCommand command) throws Throwable {

        String journeyId = command.getJourneyId();
        String stepId = command.getStepId();
        String actionId = command.getActionId();
        Map<String, Object> data = command.getData();

        JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);

        if (journeyContainer == null) {
            throw new Exception("No journey with id " + journeyId);
        }

        if (!Strings.isNullOrEmpty(journeyContainer.getRemoteJourneyTypeId())) {
            return mateuRemoteClient.runStep(journeyContainer.getRemoteBaseUrl(),
                    journeyContainer.getRemoteJourneyTypeId(), journeyContainer.getJourneyId(),
                    stepId, actionId, data);
        }

        Object viewInstance = store.getViewInstance(journeyId, stepId);

        if (viewInstance instanceof FieldEditor) {
            // no need to fill the fieldEditor
        } else if (viewInstance instanceof EntityEditor) {
            // no need to fill the entityEditor
        } else {
            data.entrySet().forEach(entry -> {
                try {
                    Object actualValue = getActualValue(entry, viewInstance);
                    ReflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
                } catch (Exception ex) {
                    System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                }
            });
        }
        store.getStep(journeyId, stepId).getView().getComponents().get(0).setData(data);

        Map<String, Method> actions = ReflectionHelper.getAllMethods(viewInstance.getClass()).stream()
                .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
                .collect(Collectors.toMap(m -> m.getName(), m -> m));

        if (actionId.startsWith("__list__")) {
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
                        throw new Exception("Crud " + methodName + " thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
                    }

                }

            }

        } else if ((viewInstance instanceof ReadOnlyPojo
                || viewInstance instanceof PersistentPojo
                || viewInstance instanceof EntityEditor
                || viewInstance.getClass().isAnnotationPresent(Entity.class))
                && "cancel".equals(actionId)) {
            store.backToStep(journeyId, store.getInitialStep(journeyId).getId());
        } else if (viewInstance instanceof EntityEditor && "edit".equals(actionId)) {
            Object editor = viewInstance;

            store.setStep(journeyId, "edit", editor);
        } else if (viewInstance.getClass().isAnnotationPresent(Entity.class) && "edit".equals(actionId)) {
            Object editor = viewInstance;

            store.setStep(journeyId, "edit", editor);
        } else if (viewInstance instanceof ReadOnlyPojo && "edit".equals(actionId)) {
            Object editor = ((ReadOnlyPojo) viewInstance).getEditor();

            if (editor ==  null) {
                throw new Exception("getEditor returned null for the ReadOnlyPojo " +
                        viewInstance.getClass().getSimpleName());
            }

            store.setStep(journeyId, "edit", editor);
        } else if (viewInstance instanceof PersistentPojo && "save".equals(actionId)) {
            ((PersistentPojo) viewInstance).save();

            Step initialStep = store.getInitialStep(journeyId);

            List<Destination> youMayBeInterestedIn = new ArrayList<>();
            Step detail = store.getStep(journeyId, "view");
            if (detail != null) {
                Object pojo = store.getViewInstance(journeyId, "view");
                if (pojo instanceof ReadOnlyPojo) {
                    ((ReadOnlyPojo) pojo).load(((ReadOnlyPojo) pojo).getId());
                    store.setStep(journeyId, "view", pojo);
                }
                youMayBeInterestedIn.add(new Destination(DestinationType.ActionId,
                        "Return to " + detail.getName() + " detail", "view"));
            }

            Result whatToShow = new Result(ResultType.Success,
                    "" + viewInstance.toString() + " has been saved", youMayBeInterestedIn,
                    new Destination(DestinationType.ActionId,
                            "Return to " + initialStep.getName(), initialStep.getId()));
            String newStepId = "result_" + UUID.randomUUID().toString();
            store.setStep(journeyId, newStepId, whatToShow);

        } else if (viewInstance.getClass().isAnnotationPresent(Entity.class) && "save".equals(actionId)) {
            ReflectionHelper.newInstance(Merger.class).merge(viewInstance);

            Step initialStep = store.getInitialStep(journeyId);

            Result whatToShow = new Result(ResultType.Success,
                    "" + viewInstance.toString() + " has been saved", List.of(),
                    new Destination(DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()));
            String newStepId = "result_" + UUID.randomUUID().toString();
            store.setStep(journeyId, newStepId, whatToShow);

        } else if (viewInstance instanceof EntityEditor && "save".equals(actionId)) {
            EntityEditor entityEditor = (EntityEditor) viewInstance;
            Merger merger = store.getApplicationContext().getBean(Merger.class);
            merger.mergeAndCommit(data, entityEditor.getEntityClass());
            data.remove("__entityClassName__");
            entityEditor.setData(data);
            store.setStep(journeyId, stepId, entityEditor);

            Step initialStep = store.getInitialStep(journeyId);

            Result whatToShow = new Result(ResultType.Success,
                    "" + viewInstance.toString() + " has been saved", List.of(),
                    new Destination(DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()));
            String newStepId = "result_" + UUID.randomUUID().toString();
            store.setStep(journeyId, newStepId, whatToShow);

        } else if (viewInstance instanceof FieldEditor && "save".equals(actionId)) {
            FieldEditor fieldEditor = (FieldEditor) viewInstance;

            Step initialStep = store.getStep(journeyId, fieldEditor.getInitialStep());

            io.mateu.remote.dtos.Component form = initialStep.getView().getComponents().get(0);

            Object object = Helper.fromJson(Helper.toJson(data), fieldEditor.getType());
            data = Serializer.toMap(object);
            data.put("__toString", "" + object);

            form.getData().put(fieldEditor.getFieldId(), data);

            store.backToStep(journeyId, initialStep.getId()); // will save the step
        } else if (viewInstance instanceof FieldEditor && "cancel".equals(actionId)) {
            FieldEditor fieldEditor = (FieldEditor) viewInstance;
            store.backToStep(journeyId, fieldEditor.getInitialStep());
        } else if (viewInstance instanceof MethodParametersEditor && "run".equals(actionId)) {
            MethodParametersEditor methodParametersEditor = (MethodParametersEditor) viewInstance;

            Step initialStep = store.getStep(journeyId, methodParametersEditor.getInitialStep());

            Object object = Serializer.fromMap(methodParametersEditor.getData(),
                    methodParametersEditor.getType());

            Method m = ReflectionHelper.getMethod(methodParametersEditor.getType(), methodParametersEditor.getMethodId());
            List<Object> values = new ArrayList<>();
            for (int i = 0; i < m.getParameterCount(); i++) {
                values.add(getActualValue(m.getParameterTypes()[i], data.get("param_" + i)));
            }
            Object result = m.invoke(object, values.toArray());

            store.setStep(journeyId, initialStep.getId(), object);

            Object whatToShow = result;
            if (!void.class.equals(m.getReturnType())) {
                if (whatToShow instanceof Result) {
                    addBackDestination((Result) whatToShow,
                            store.getInitialStep(journeyId));
                }
                String newStepId = "result_" + UUID.randomUUID().toString();
                store.setStep(journeyId, newStepId, whatToShow);
            } else {
                store.backToStep(journeyId, initialStep.getId()); // will save the step
            }
        } else if (viewInstance instanceof MethodParametersEditor && "cancel".equals(actionId)) {
            MethodParametersEditor methodParametersEditor = (MethodParametersEditor) viewInstance;
            store.backToStep(journeyId, methodParametersEditor.getInitialStep());
        } else if (viewInstance instanceof Result) {
            Step step = store.getStep(journeyId, actionId);
            store.getJourney(journeyId).setCurrentStepId(step.getId());
            store.getJourney(journeyId).setCurrentStepDefinitionId(step.getType());
        } else if (actionId.startsWith("__editfield__")) {

            String fieldId = actionId.substring("__editfield__".length());

            FieldInterfaced field = ReflectionHelper.getFieldByName(viewInstance.getClass(), fieldId);

            Object targetValue = ReflectionHelper.getValue(field, viewInstance);

            if (targetValue == null) {
                targetValue = ReflectionHelper.newInstance(field.getType());
            }

            store.setStep(journeyId, actionId, new FieldEditor(targetValue,
                    fieldId,
                    store.getCurrentStep(journeyId).getId()));

        } else if (actions.containsKey(actionId)) {

            Method m = actions.get(actionId);

            if (m.getParameterCount() > 0) {

                store.setStep(journeyId, actionId, new MethodParametersEditor(viewInstance,
                        m.getName(),
                        store.getCurrentStep(journeyId).getId()));

            } else {

                try {
                    Object result = m.invoke(viewInstance);

                    store.setStep(journeyId, stepId, viewInstance);

                    Object whatToShow = result;
                    if (!void.class.equals(m.getReturnType())) {
                        if (whatToShow instanceof Result) {
                            addBackDestination((Result) whatToShow,
                                    store.getInitialStep(journeyId));
                        }
                        String newStepId = "result_" + UUID.randomUUID().toString();
                        store.setStep(journeyId, newStepId, whatToShow);
                    }

                } catch (InvocationTargetException ex) {
                    Throwable targetException = ex.getTargetException();
                    System.out.println("" + targetException.getClass().getSimpleName() +
                            ": " + targetException.getMessage());
                    throw targetException;
                }

            }

        } else {
            throw new Exception("Unkonwn action " + actionId);
        }

        return Mono.empty();
    }

    private void addBackDestination(Result result, Step initialStep) {
        if (result.getNowTo() != null) {
            return;
        }
        result.setNowTo(new Destination(DestinationType.ActionId,
                "Back to " + initialStep.getName(), initialStep.getId()));
    }

    private Object deserializeRow(Object m, Listing viewInstance) {
        try {
            return Helper.fromJson(Helper.toJson(m), viewInstance.getRowClass());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    public static Object getActualValue(Class targetType, Object value) throws Exception {
        Object targetValue = value;
        if (value == null) {
            if (int.class.equals(targetType)) {
                return 0;
            }
            if (long.class.equals(targetType)) {
                return 0l;
            }
            if (double.class.equals(targetType)) {
                return 0.0;
            }
            if (boolean.class.equals(targetType)) {
                return false;
            }
            return null;
        }
        if (!targetType.equals(value.getClass())) {
            if (int.class.equals(targetType)) {
                targetValue = Integer.parseInt("" + value);
            } else if (long.class.equals(targetType)) {
                targetValue = Long.parseLong("" + value);
            } else if (double.class.equals(targetType)) {
                targetValue = Double.parseDouble("" + value);
            } else if (boolean.class.equals(targetType)) {
                targetValue = Boolean.parseBoolean("" + value);
            } else if (Integer.class.equals(targetType)) {
                targetValue = Integer.parseInt("" + value);
            } else if (Long.class.equals(targetType)) {
                targetValue = Long.parseLong("" + value);
            } else if (Double.class.equals(targetType)) {
                targetValue = Double.parseDouble("" + value);
            } else if (Boolean.class.equals(targetType)) {
                targetValue = Boolean.parseBoolean("" + value);
            } else if (LocalDate.class.equals(targetType)) {
                targetValue = LocalDate.parse("" + value);
            } else if (LocalDateTime.class.equals(targetType)) {
                targetValue = LocalDateTime.parse("" + value);
            } else if (LocalTime.class.equals(targetType)) {
                targetValue = LocalTime.parse("" + value);
            } else if (targetType.isEnum()) {
                targetValue = Enum.valueOf(targetType, "" + value);
            } else if (Class.class.equals(targetType)) {
                targetValue = Class.forName("" + value);
            }
        }
        return targetValue;
    }

    public static Object getActualValue(Map.Entry<String, Object> entry, Object viewInstance) throws Exception {
        Object targetValue = entry.getValue();
        if (entry.getValue() != null) {
            FieldInterfaced f = ReflectionHelper.getFieldByName(viewInstance.getClass(), entry.getKey());
            if (List.class.isAssignableFrom(f.getType())) {
                if (ExternalReference.class.equals(ReflectionHelper.getGenericClass(f.getGenericType()))) {
                    List t = new ArrayList();
                    List l = (List) entry.getValue();
                    for (Object o : l) {
                        Map<String, Object> m = (Map<String, Object>) o;
                        t.add(new ExternalReference(m.get("value"), (String) m.get("key")));
                    }
                    return t;
                }
                if (Integer.class.equals(ReflectionHelper.getGenericClass(f.getGenericType()))) {
                    List t = new ArrayList();
                    List l = (List) entry.getValue();
                    for (Object v : l) {
                        if (v instanceof String) {
                            v = Integer.parseInt((String) v);
                        }
                        t.add(v);
                    }
                    return t;
                }
                return entry.getValue();
            }
            if (f.getType().isArray()) {
                if (List.class.isAssignableFrom(entry.getValue().getClass())) {
                    List l = (List) entry.getValue();
                    if (boolean[].class.equals(f.getType())) {
                        boolean[] t = new boolean[l.size()];
                        for (int i = 0; i < l.size(); i++) {
                            Object v = l.get(i);
                            boolean tv = false;
                            if (v instanceof Boolean) tv = ((Boolean) v).booleanValue();
                            t[i] = tv;
                        }
                        return t;
                    }
                    if (int[].class.equals(f.getType())) {
                        int[] t = new int[l.size()];
                        for (int i = 0; i < l.size(); i++) {
                            Object v = l.get(i);
                            int tv = 0;
                            if (v instanceof Integer) tv = ((Integer) v).intValue();
                            else if (v instanceof String) tv = Integer.parseInt((String) v);
                            t[i] = tv;
                        }
                        return t;
                    }
                    if (double[].class.equals(f.getType())) {
                        double[] t = new double[l.size()];
                        for (int i = 0; i < l.size(); i++) {
                            Object v = l.get(i);
                            double tv = 0;
                            if (v instanceof Double) tv = ((Double) v).doubleValue();
                            t[i] = tv;
                        }
                        return t;
                    }
                    if (String[].class.equals(f.getType())) {
                        return l.toArray(new String[0]);
                    }
                    if (ExternalReference[].class.equals(f.getType())) {
                        List t = new ArrayList();
                        for (int i = 0; i < l.size(); i++) {
                            Map<String, Object> v = (Map<String, Object>) l.get(i);
                            t.add(new ExternalReference(v.get("value"), (String) v.get("key")));
                        }
                        return t.toArray(new ExternalReference[0]);
                    }
                    if (f.getType().getComponentType().isEnum()) {
                        List t = new ArrayList();
                        for (int i = 0; i < l.size(); i++) {
                            Object v = l.get(i);
                            t.add(Enum.valueOf((Class) f.getType().getComponentType(), (String) v));
                        }
                        return t.toArray((Object[]) Array.newInstance(f.getType().getComponentType(), 0));
                    }
                }
            }
            if (!f.getType().isAssignableFrom(entry.getValue().getClass())) {
                if (isFile(f)) {
                    List<Map<String, Object>> files = (List) entry.getValue();
                    if (f.getType().isArray() || List.class.isAssignableFrom(f.getType())) {
                        List values = new ArrayList();
                        for (Map<String, Object> file : files) {
                            values.add(toFile(f, (Class<?>) f.getGenericType(), file));
                        }
                        if (f.getType().isArray()) {
                            targetValue = values.toArray();
                        } else {
                            targetValue = values;
                        }
                    } else {
                        Map<String, Object> value = files.get(0);
                        Class<?> genericType = f.getType();
                        targetValue = toFile(f, genericType, value);
                    }

                }
                if (ExternalReference.class.isAssignableFrom(f.getType())) {
                    Map<String, Object> value = (Map<String, Object>) entry.getValue();
                    targetValue = new ExternalReference(value.get("value"), (String) value.get("key"));
                }
                if (entry.getValue() instanceof String) {
                    targetValue = getActualValue(f.getType(), entry.getValue());
                }
                if (entry.getValue() instanceof Map) {
                    targetValue = Serializer.fromMap((Map<String, Object>) entry.getValue(), f.getType());
                }
            }
        }
        return targetValue;

    }

    private static Object toFile(FieldInterfaced f, Class<?> genericType, Map<String, Object> value) {
        Object targetValue = null;
        if (String.class.equals(genericType)) {
            targetValue =  value.get("targetUrl") + "/" + value.get("name");
        } else if (java.io.File.class.equals(genericType)){
            try {
                targetValue = StorageServiceAccessor.get()
                        .loadAsResource((String) value.get("id"), (String) value.get("name")).getFile();
            } catch (IOException e) {
                e.printStackTrace();
            } catch (AuthenticationException e) {
                e.printStackTrace();
            }
        } else {
            log.warn("field " + f.getName() + " from " + f.getDeclaringClass().getName() +
                    " is not valid for a file type");
        }
        return targetValue;
    }


    private static boolean isFile(FieldInterfaced field) {
        return java.io.File.class.equals(field.getType())
                || java.io.File[].class.equals(field.getType())
                || java.io.File.class.equals(field.getGenericType())
                || field.isAnnotationPresent(File.class);
    }

}
