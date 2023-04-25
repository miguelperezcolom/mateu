package io.mateu.remote.domain.commands.runStep;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.files.StorageServiceAccessor;
import io.mateu.remote.domain.files.FileChecker;
import io.mateu.util.Serializer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.naming.AuthenticationException;
import java.io.IOException;
import java.lang.reflect.Array;
import java.lang.reflect.Modifier;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class ActualValueExtractor {

    @Autowired
    FileChecker fileChecker;

    public Object getActualValue(Class targetType, Object value) throws Exception {
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

    private boolean checkInjected(Object viewInstance, String fieldName) {
        FieldInterfaced field = ReflectionHelper.getFieldByName(viewInstance.getClass(), fieldName);
        return field != null && (field.isAnnotationPresent(Autowired.class) || Modifier.isFinal(field.getModifiers()));
    }

    public Object getActualValue(Map.Entry<String, Object> entry, Object viewInstance) throws Exception {
        Object targetValue = entry.getValue();
        FieldInterfaced f = ReflectionHelper.getFieldByName(viewInstance.getClass(), entry.getKey());
        if (checkInjected(viewInstance, f.getId())) {
            Object injectedValue = ReflectionHelper.getValue(f, viewInstance);
            if (injectedValue != null && entry.getValue() != null && entry.getValue() instanceof Map) {
                Map<String, Object> incomingValues = (Map<String, Object>) entry.getValue();
                for (FieldInterfaced crudField : ReflectionHelper.getAllEditableFields(injectedValue.getClass())) {
                    ReflectionHelper.setValue(crudField, injectedValue, incomingValues.get(crudField.getId()));
                }
            }
            return injectedValue;
        }
        if (entry.getValue() != null) {
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
                if (fileChecker.isFile(f)) {
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

    private Object toFile(FieldInterfaced f, Class<?> genericType, Map<String, Object> value) {
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

}
