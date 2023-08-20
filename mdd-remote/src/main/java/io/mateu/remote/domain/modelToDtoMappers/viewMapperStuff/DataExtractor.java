package io.mateu.remote.domain.modelToDtoMappers.viewMapperStuff;

import io.mateu.mdd.shared.annotations.File;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.editors.ObjectEditor;
import io.mateu.util.Serializer;
import org.springframework.stereotype.Service;

import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.util.*;

@Service
public class DataExtractor {

    public Map<String, Object> getData(Object uiInstance, Object actualUiInstance) throws Exception {
        if (uiInstance instanceof EntityEditor) {
            Map<String, Object> data = new HashMap<>();
            data.putAll(((EntityEditor) uiInstance).getData());
            data.put("__entityClassName__", ((EntityEditor) uiInstance).getEntityClass().getName());
            return data;
        }
        if (uiInstance instanceof ObjectEditor) {
            Map<String, Object> data = new HashMap<>();
            data.putAll(((ObjectEditor) uiInstance).getData());
            data.put("__entityClassName__", ((ObjectEditor) uiInstance).getType().getName());
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
        if (uiInstance instanceof ObjectEditor) {
            data.putAll(((ObjectEditor) uiInstance).getData());
            data.put("__entityClassName__", ((ObjectEditor) uiInstance).getType().getName());
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
        convertStringsToFiles(uiInstance, data);
        addStringValueForObjects(uiInstance, data);
        return data;
    }

    private void convertStringsToFiles(Object uiInstance, Map<String, Object> data) {
        ReflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
                .filter(f -> String.class.equals(f.getType()))
                .filter(f -> f.isAnnotationPresent(File.class))
                .forEach(f -> {
                    try {
                        var value = (String) ReflectionHelper.getValue(f, uiInstance);
                        if (value != null) {
                            var url = new URL(value);
                            var targetUrl = url.toString().substring(0, url.toString().lastIndexOf("/"));
                            data.put(f.getId(), Map.of(
                                    "targetUrl", targetUrl
                                    , "id", extractId(url.getFile())
                                    , "name", extractFileFime(url.getFile())
                                    , "type", URLConnection.guessContentTypeFromName(url.getFile())
                            ));
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
        ReflectionHelper.getAllEditableFields(uiInstance.getClass()).stream()
                .filter(f -> List.class.isAssignableFrom(f.getType()))
                .filter(f -> String.class.equals(ReflectionHelper.getGenericClass(f.getGenericType())))
                .filter(f -> f.isAnnotationPresent(File.class))
                .forEach(f -> {
                    try {
                        var value = (List<String>) ReflectionHelper.getValue(f, uiInstance);
                        if (value != null) {
                            var targetList = new ArrayList<>();
                            value.forEach(v -> {
                                URL url = null;
                                try {
                                    url = new URL(v);
                                    var targetUrl = url.toString().substring(0, url.toString().lastIndexOf("/"));
                                    targetList.add(Map.of(
                                            "targetUrl", targetUrl
                                            , "id", extractId(url.getFile())
                                            , "name", extractFileFime(url.getFile())
                                            , "type", URLConnection.guessContentTypeFromName(url.getFile())
                                    ));
                                } catch (MalformedURLException e) {
                                    e.printStackTrace();
                                }
                            });
                            data.put(f.getId(), targetList);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
    }

    private String extractId(String path) {
        var tokens = path.split("/");
        return tokens[tokens.length - 2];
    }

    private String extractFileFime(String path) {
        return path.substring(path.lastIndexOf("/") + 1);
    }

    private void addStringValueForObjects(Object uiInstance, Map<String, Object> data) {
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
    }

}
