package io.mateu.remote.domain.commands;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.File;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.*;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.files.StorageServiceAccessor;
import io.mateu.remote.domain.mappers.ViewMapper;
import io.mateu.remote.domain.store.JourneyContainer;
import io.mateu.remote.domain.store.JourneyStoreService;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import io.mateu.util.persistence.JPAHelper;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import javax.naming.AuthenticationException;
import javax.persistence.Entity;
import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Builder
@Slf4j
public class RunStepActionCommand {

    private String journeyId;

    private String stepId;

    private String actionId;

    private Map<String, Object> data;

    public void run() throws Throwable {

        JourneyStoreService store = JourneyStoreService.get();

        Object viewInstance = store.getViewInstance(journeyId, stepId);

        data.entrySet().forEach(entry -> {
            try {
                Object actualValue = getActualValue(entry, viewInstance);
                ReflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
            } catch (Exception ex) {
                System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
            }
        });
        store.getStep(journeyId, stepId).getView().getComponents().get(0).setData(data);

        Map<String, Method> actions = ReflectionHelper.getAllMethods(viewInstance.getClass()).stream()
                .filter(m -> m.isAnnotationPresent(Action.class) || m.isAnnotationPresent(MainAction.class))
                .collect(Collectors.toMap(m -> m.getName(), m -> m));


        if (viewInstance instanceof RpcCrudView && "new".equals(actionId)) {

            Object editor = null;
            try {
                editor = ((RpcCrudView) viewInstance).onNew();
            } catch (Throwable e) {
                throw new Exception("Crud onNew thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
            }

            if (editor == null) {
                throw new Exception("Crud onNew and onEdit returned null");
            }

            String newStepId = "new_" + UUID.randomUUID().toString();
            store.setStep(journeyId, newStepId, editor);

        } else if (viewInstance instanceof RpcCrudView && "delete".equals(actionId)) {

            List selectedRows = (List) data.get("_selectedRows");

            if (selectedRows == null) {
                throw new Exception("No row selected");
            }

            try {
                Set<Object> targetSet = new HashSet((Collection) selectedRows.stream().map(o -> (Map)o)
                        .map(m -> deserializeRow(m, (RpcView) viewInstance))
                        .collect(Collectors.toList()));
                ((RpcCrudView) viewInstance).delete(targetSet);

                boolean isCrud = store.isCrud(journeyId);

                Result whatToShow = new Result(ResultType.Success,
                        "" + selectedRows + " elements have been deleted", List.of(),
                        new Destination(DestinationType.ActionId, "Back to " + store.getStep(journeyId, "list").getName(), "list"));
                String newStepId = "result_" + UUID.randomUUID().toString();
                store.setStep(journeyId, newStepId, whatToShow);

            } catch (Throwable e) {
                throw new Exception("Crud delete thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
            }

        } else if (viewInstance instanceof RpcCrudView && "edit".equals(actionId)) {

            Object row = data.get("_selectedRow");

            if (row == null) {
                throw new Exception("No row selected");
            }

            Object editor = null;
            try {

                editor = ((RpcCrudView) viewInstance).onEdit(Helper.fromJson(Helper.toJson(row),
                        ((RpcCrudView) viewInstance).getRowClass()));
            } catch (Throwable e) {
                throw new Exception("Crud onEdit thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
            }

            if (editor == null) {
                throw new Exception("Crud onEdit returned null");
            }

            String newStepId = "editor";
            if (editor instanceof ReadOnlyPojo && !(editor instanceof PersistentPojo)) {
                newStepId = "detail";
            }
            store.setStep(journeyId, newStepId, editor);

        } else if (viewInstance instanceof RpcCrudView && actionId.startsWith("__row__")) {

            Object row = data.get("_clickedRow");

            if (row == null) {
                throw new Exception("No row clicked");
            }

            String methodName = actionId.replaceAll("__row__", "");
            try {

                Method method = viewInstance.getClass().getMethod(methodName, ((RpcCrudView) viewInstance).getRowClass());

                method.invoke(viewInstance, Helper.fromJson(Helper.toJson(row),
                        ((RpcCrudView) viewInstance).getRowClass()));
            } catch (Throwable e) {
                throw new Exception("Crud " + methodName + " thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
            }

        } else if ((viewInstance instanceof ReadOnlyPojo
                || viewInstance instanceof PersistentPojo
        || viewInstance.getClass().isAnnotationPresent(Entity.class))
                && "cancel".equals(actionId)) {
            store.backToStep(journeyId, "list");
        } else if (viewInstance instanceof ReadOnlyPojo && "edit".equals(actionId)) {
            Object editor = ((ReadOnlyPojo) viewInstance).getEditor();

            if (editor ==  null) {
                throw new Exception("getEditor returned null for the ReadOnlyPojo " +
                        viewInstance.getClass().getSimpleName());
            }

            store.setStep(journeyId, "editor", editor);
        } else if (viewInstance instanceof PersistentPojo && "save".equals(actionId)) {
            ((PersistentPojo) viewInstance).save();

            Step initialStep = store.getInitialStep(journeyId);

            List<Destination> youMayBeInterestedIn = new ArrayList<>();
            Step detail = store.getStep(journeyId, "detail");
            if (detail != null) {
                youMayBeInterestedIn.add(new Destination(DestinationType.ActionId,
                        "Return to " + detail.getName() + " detail", "detail"));
            }

            Result whatToShow = new Result(ResultType.Success,
                    "" + viewInstance.toString() + " has been saved", youMayBeInterestedIn,
                    new Destination(DestinationType.ActionId,
                            "Return to " + initialStep.getName(), initialStep.getId()));
            String newStepId = "result_" + UUID.randomUUID().toString();
            store.setStep(journeyId, newStepId, whatToShow);

        } else if (viewInstance.getClass().isAnnotationPresent(Entity.class) && "save".equals(actionId)) {
            JPAHelper.transact(em -> {
                em.merge(viewInstance);
            });

            Step initialStep = store.getInitialStep(journeyId);

            Result whatToShow = new Result(ResultType.Success,
                    "" + viewInstance.toString() + " has been saved", List.of(),
                    new Destination(DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()));
            String newStepId = "result_" + UUID.randomUUID().toString();
            store.setStep(journeyId, newStepId, whatToShow);

        } else if (viewInstance instanceof Result) {
            Step step = store.getStep(journeyId, actionId);
            store.getJourney(journeyId).setCurrentStepId(step.getId());
            store.getJourney(journeyId).setCurrentStepDefinitionId(step.getType());
        } else if (actions.containsKey(actionId)) {

            Method m = actions.get(actionId);

            Object result = m.invoke(viewInstance);

            Object whatToShow = result;
            if (!void.class.equals(m.getReturnType())) {
                String newStepId = "result_" + UUID.randomUUID().toString();
                store.setStep(journeyId, newStepId, whatToShow);
            }

            store.getStep(journeyId, stepId).getView().getComponents().get(0).setData(getData(viewInstance));

        } else {
            throw new Exception("Unkonwn action " + actionId);
        }

    }

    private Object deserializeRow(Object m, RpcView viewInstance) {
        try {
            return Helper.fromJson(Helper.toJson(m), viewInstance.getRowClass());
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }

    private Map<String, Object> getData(Object viewInstance) throws IOException {
        return ViewMapper.getData(viewInstance);
    }

    public static Object getActualValue(Map.Entry<String, Object> entry, Object viewInstance) throws NoSuchFieldException {
        Object targetValue = entry.getValue();
        if (entry.getValue() != null) {
            Field f = viewInstance.getClass().getDeclaredField(entry.getKey());
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
                    if (long.class.equals(f.getType())) {
                        targetValue = Long.valueOf((String) entry.getValue());
                    } else if (int.class.equals(f.getType())) {
                        targetValue = Integer.valueOf((String) entry.getValue());
                    } else if (double.class.equals(f.getType())) {
                        targetValue = Double.valueOf((String) entry.getValue());
                    } else if (LocalDate.class.equals(f.getType())) {
                        targetValue = LocalDate.parse((String) entry.getValue());
                    } else if (LocalDateTime.class.equals(f.getType())) {
                        targetValue = LocalDateTime.parse((String) entry.getValue());
                    } else if (LocalTime.class.equals(f.getType())) {
                        targetValue = LocalTime.parse((String) entry.getValue());
                    } else if (f.getType().isEnum()) {
                        targetValue = Enum.valueOf((Class) f.getType(), (String) entry.getValue());
                    }
                }
            }
        }
        return targetValue;
    }

    private static Object toFile(Field f, Class<?> genericType, Map<String, Object> value) {
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


    private static boolean isFile(Field field) {
        return java.io.File.class.equals(field.getType())
                || java.io.File[].class.equals(field.getType())
                || java.io.File.class.equals(field.getGenericType())
                || field.isAnnotationPresent(File.class);
    }

}
