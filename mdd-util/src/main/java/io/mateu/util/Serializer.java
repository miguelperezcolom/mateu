package io.mateu.util;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.common.base.Strings;
import io.mateu.mdd.shared.annotations.Attribute;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.persistence.EntitySerializer;
import jakarta.persistence.Entity;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.XMLOutputter;

import java.io.IOException;
import java.io.StringReader;
import java.lang.reflect.InvocationTargetException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static io.mateu.reflection.ReflectionHelper.*;

public class Serializer {

    private static ObjectMapper mapper = new ObjectMapper();
    private static ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    static {
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
        yamlMapper.enable(SerializationFeature.INDENT_OUTPUT);
        // Now you should use JavaTimeModule instead
        yamlMapper.registerModule(new JavaTimeModule());
        yamlMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }


    public static Map<String, Object> fromJson(String json) throws IOException {
        if (json == null || "".equals(json)) json = "{}";
        return mapper.readValue(json, Map.class);
    }

    public static <T> T fromJson(String json, Class<T> c) throws Exception {
        if (json == null || "".equals(json)) json = "{}";
        return pojoFromJson(json, c);
    }

    public static <T> T pojoFromJson(String json, Class<T> c) throws Exception {
        if (json == null || "".equals(json)) json = "{}";
        return mapper.readValue(json, c);
    }

    public static String toJson(Object o) throws Exception {
        if (o != null && o.getClass().isAnnotationPresent(Entity.class)) {
            return entityToJson(o);
        }
        return mapper.writeValueAsString(o);
    }

    private static String entityToJson(Object o) throws Exception {
        return toJson(Helper.getImpl(EntitySerializer.class).toMap(o));
    }

    public static Map<String, Object> toMap(Object o) throws Exception {
        if (o == null) {
            return Map.of();
        }
        if (isBasic(o)) {
            return Map.of("value", o);
        }
        Map<String, Object> data = fromJson(toJson(o));
        applyAttributeNames(data, o);
        return data;
    }

    private static void applyAttributeNames(Map<String, Object> data, Object o) throws Exception {
        if (o == null) {
            return;
        }
        for (Map.Entry<String, Object> e : data.entrySet()) {
            if (e.getValue() != null && e.getValue() instanceof Map) {
                applyAttributeNames((Map<String, Object>) e.getValue(), getValue(e.getKey(), o));
            }
        }
        for (FieldInterfaced f : getAllFields(o.getClass())) {
            if (data.containsKey(f.getName())
                    && f.isAnnotationPresent(Attribute.class)
                    && !Strings.isNullOrEmpty(f.getAnnotation(Attribute.class).value())
            ) {
                Object v = data.get(f.getName());
                data.remove(f.getName());
                data.put(f.getAnnotation(Attribute.class).value(), v);
            }
        }
    }

    private static boolean isBasic(Object o) {
        Class type = o.getClass();
        return int.class.equals(type)
                || Integer.class.equals(type)
                || double.class.equals(type)
                || Double.class.equals(type)
                || boolean.class.equals(type)
                || Boolean.class.equals(type)
                || String.class.equals(type)
                || float.class.equals(type)
                || Float.class.equals(type)
                || BigDecimal.class.equals(type)
                || type.isEnum()
                ;
    }

    public static <T> T fromMap(Map<String, Object> map, Class<T> c) throws Exception {
        if (map == null) {
            return null;
        }
        String json = toJson(map);
        return pojoFromJson(json, c);
    }

    private static Map<String, Object> entityToMap(Object o) throws Exception {
        return Helper.getImpl(EntitySerializer.class).toMap(o);
    }

    public static Map<String, Object> fromYaml(String yaml) throws IOException {
        if (yaml == null) yaml = "";
        return yamlMapper.readValue(yaml, Map.class);
    }

    public static <T> T fromYaml(String yaml, Class<T> c) throws IOException {
        if (yaml == null) yaml = "";
        return yamlMapper.readValue(yaml, c);
    }

    public static String toYaml(Object o) throws IOException {
        return yamlMapper.writeValueAsString(o);
    }

    public static Element toXml(Object o) {
        return toXml(o, new ArrayList<>());
    }

    public static String toString(Element o) {
        return new XMLOutputter().outputString(o);
    }

    public static Element toXml(Object o, List visited) {
        if (o == null) {
            return null;
        } else {
            if (!visited.contains(o)) {
                visited.add(o);
            }
            Element e = new Element(o.getClass().getSimpleName());
            e.setAttribute("className", o.getClass().getName());
            for (FieldInterfaced f : getAllFields(o.getClass())) {
                try {
                    Object i = getValue(f, o);

                    if (i != null) {
                        if (ReflectionHelper.isBasico(i)) {
                            e.setAttribute(f.getName(), "" + i);
                        } else {

                            //todo: añadir casos collection y map

                            e.addContent(toXml(i, visited));
                        }
                    }

                } catch (Exception e1) {
                    e1.printStackTrace();
                }
            }
            return e;
        }
    }


    public static Object fromXml(String s) {
        if (Strings.isNullOrEmpty(s)) return null;
        else {
            try {
                Document doc = new SAXBuilder().build(new StringReader(s));

                Element root = doc.getRootElement();

                Object o = null;

                //todo: acabar

                if (root.getAttribute("className") != null && !Strings.isNullOrEmpty(root.getAttributeValue("className"))) {
                    o = newInstance(Class.forName(root.getAttributeValue("className")));

                    for (FieldInterfaced f : getAllFields(o.getClass())) {
                        try {
                            String sv = root.getAttributeValue(f.getId());

                            if (sv != null) {
                                if (ReflectionHelper.isBasico(f.getType())) {
                                    setValue(f, o, newInstance(f.getType(), sv));
                                } else {

                                    //todo: añadir casos collection y map


                                }
                            }

                        } catch (Exception e1) {
                            e1.printStackTrace();
                        }
                    }

                } else {
                    o = new HashMap<>();
                }



                return o;

            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
    }
}
