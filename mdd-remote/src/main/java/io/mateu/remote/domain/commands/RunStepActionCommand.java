package io.mateu.remote.domain.commands;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.File;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.*;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.remote.domain.StepMapper;
import io.mateu.remote.domain.StorageServiceAccessor;
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

        Object viewInstance = JourneyStoreAccessor.get().getViewInstance(journeyId, stepId);

        data.entrySet().forEach(entry -> {
            try {
                Object actualValue = getActualValue(entry, viewInstance);
                ReflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
            } catch (Exception ex) {
                System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
            }
        });

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
            JourneyStoreAccessor.get().putStep(newStepId, new StepMapper().map(editor));
            JourneyStoreAccessor.get().putViewInstance(newStepId, editor);
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepId(newStepId);
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepDefinitionId(newStepId);

        } else if (viewInstance instanceof RpcCrudView && "delete".equals(actionId)) {

            List selectedRows = (List) data.get("_selectedRows");

            if (selectedRows == null) {
                throw new Exception("No row selected");
            }

            try {
                Set<Object> targetSet = new HashSet<>(selectedRows);
                ((RpcCrudView) viewInstance).delete(targetSet);

                Result whatToShow = new Result(ResultType.Success,
                        "" + selectedRows + " elements have been deleted", List.of(),
                        new Destination(DestinationType.ActionId, "list"));
                String newStepId = "result_" + UUID.randomUUID().toString();
                JourneyStoreAccessor.get().putStep(newStepId, new StepMapper().map(whatToShow));
                JourneyStoreAccessor.get().putViewInstance(newStepId, whatToShow);
                JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepId(newStepId);
                JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepDefinitionId(newStepId);

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

            String newStepId = "edit_" + UUID.randomUUID().toString();
            JourneyStoreAccessor.get().putStep(newStepId, new StepMapper().map(editor));
            JourneyStoreAccessor.get().putViewInstance(newStepId, editor);
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepId(newStepId);
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepDefinitionId(newStepId);
        } else if ((viewInstance instanceof PersistentPojo
        || viewInstance.getClass().isAnnotationPresent(Entity.class)) && "cancel".equals(actionId)) {
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepId("list");
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepDefinitionId("list");
        } else if (viewInstance instanceof PersistentPojo && "save".equals(actionId)) {
            ((PersistentPojo) viewInstance).save();

            Result whatToShow = new Result(ResultType.Success,
                    "" + viewInstance.toString() + " has been saved", List.of(),
                    new Destination(DestinationType.ActionId, "list"));
            String newStepId = "result_" + UUID.randomUUID().toString();
            JourneyStoreAccessor.get().putStep(newStepId, new StepMapper().map(whatToShow));
            JourneyStoreAccessor.get().putViewInstance(newStepId, whatToShow);
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepId(newStepId);
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepDefinitionId(newStepId);

        } else if (viewInstance.getClass().isAnnotationPresent(Entity.class) && "save".equals(actionId)) {
            JPAHelper.transact(em -> {
                em.merge(viewInstance);
            });

            Result whatToShow = new Result(ResultType.Success,
                    "" + viewInstance.toString() + " has been saved", List.of(),
                    new Destination(DestinationType.ActionId, "list"));
            String newStepId = "result_" + UUID.randomUUID().toString();
            JourneyStoreAccessor.get().putStep(newStepId, new StepMapper().map(whatToShow));
            JourneyStoreAccessor.get().putViewInstance(newStepId, whatToShow);
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepId(newStepId);
            JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepDefinitionId(newStepId);

        } else if (actions.containsKey(actionId)) {

            Method m = actions.get(actionId);

            Object result = m.invoke(viewInstance);

            Object whatToShow = result;
            if (!void.class.equals(m.getReturnType())) {
                String newStepId = "result_" + UUID.randomUUID().toString();
                JourneyStoreAccessor.get().putStep(newStepId, new StepMapper().map(whatToShow));
                JourneyStoreAccessor.get().putViewInstance(newStepId, whatToShow);
                JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepId(newStepId);
                JourneyStoreAccessor.get().getJourney(journeyId).setCurrentStepDefinitionId(newStepId);
            }

        } else {
            throw new Exception("Unkonwn action " + actionId);
        }

    }

    private Object getActualValue(Map.Entry<String, Object> entry, Object viewInstance) throws NoSuchFieldException {
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

    private Object toFile(Field f, Class<?> genericType, Map<String, Object> value) {
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


    private boolean isFile(Field field) {
        return java.io.File.class.equals(field.getType())
                || java.io.File[].class.equals(field.getType())
                || java.io.File.class.equals(field.getGenericType())
                || field.isAnnotationPresent(File.class);
    }

}
