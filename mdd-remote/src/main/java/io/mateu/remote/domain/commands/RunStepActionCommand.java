package io.mateu.remote.domain.commands;

import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.File;
import io.mateu.mdd.shared.annotations.MainAction;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.JourneyStoreAccessor;
import io.mateu.remote.domain.StepMapper;
import io.mateu.remote.domain.StorageService;
import io.mateu.remote.domain.StorageServiceAccessor;
import io.mateu.remote.dtos.ActionType;
import io.mateu.util.Helper;
import io.mateu.util.persistence.JPAHelper;
import lombok.Builder;
import lombok.extern.slf4j.Slf4j;

import javax.naming.AuthenticationException;
import javax.persistence.Entity;
import java.io.IOException;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.file.Path;
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
                throw new Exception("Crud onNew returned null");
            }

            JourneyStoreAccessor.get().putStep(stepId, new StepMapper().map(editor));

        } else if (viewInstance instanceof RpcCrudView && "delete".equals(actionId)) {

            Object[] selectedRows = (Object[]) data.get("_selectedRows");

            if (selectedRows == null) {
                throw new Exception("No row selected");
            }

            try {
                Set<Object> targetSet = new HashSet<>(Arrays.asList(selectedRows));
                ((RpcCrudView) viewInstance).delete(targetSet);
            } catch (Throwable e) {
                throw new Exception("Crud delete thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
            }

            JourneyStoreAccessor.get().putStep(stepId, new StepMapper().map(viewInstance));

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

            JourneyStoreAccessor.get().putStep(stepId, new StepMapper().map(editor));
        } else if (viewInstance instanceof PersistentPojo && "save".equals(actionId)) {
            ((PersistentPojo) viewInstance).save();
        } else if (viewInstance.getClass().isAnnotationPresent(Entity.class) && "save".equals(actionId)) {
            JPAHelper.transact(em -> {
                em.merge(viewInstance);
            });
        } else if (actions.containsKey(actionId)) {

            Method m = actions.get(actionId);

            Object result = m.invoke(viewInstance);

            Object whatToShow = result;
            if (void.class.equals(m.getReturnType())) {
                whatToShow = viewInstance;
            }

            JourneyStoreAccessor.get().putStep(stepId, new StepMapper().map(whatToShow));

        } else {
            throw new Exception("Unkonwn action " + actionId);
        }

    }

    private Object getActualValue(Map.Entry<String, Object> entry, Object viewInstance) throws NoSuchFieldException {
        Object targetValue = entry.getValue();
        if (entry.getValue() != null) {
            Field f = viewInstance.getClass().getDeclaredField(entry.getKey());
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
            log.warn("field " + f.getName() + " from " + f.getDeclaringClass().getName() + " is not valid for a file type");
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
