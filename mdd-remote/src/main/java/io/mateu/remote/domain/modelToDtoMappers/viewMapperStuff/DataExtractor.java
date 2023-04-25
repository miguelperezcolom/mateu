package io.mateu.remote.domain.modelToDtoMappers.viewMapperStuff;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.util.Serializer;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

@Service
public class DataExtractor {

    public Map<String, Object> getData(Object uiInstance, Object actualUiInstance) throws Exception {
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

    public Map<String, Object> getData(Object uiInstance) throws Exception {
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

}
