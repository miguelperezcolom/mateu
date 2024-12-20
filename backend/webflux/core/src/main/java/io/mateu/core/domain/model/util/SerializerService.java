package io.mateu.core.domain.model.util;

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.PropertyAccessor;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.introspect.AnnotatedField;
import com.fasterxml.jackson.databind.introspect.VisibilityChecker;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.usecases.*;
import io.mateu.core.domain.model.util.persistence.EntitySerializer;
import io.mateu.uidl.annotations.Attribute;
import io.mateu.uidl.data.IconChooser;
import io.mateu.uidl.interfaces.Serializer;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.Entity;
import java.io.IOException;
import java.io.StringReader;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.jdom2.Document;
import org.jdom2.Element;
import org.jdom2.input.SAXBuilder;
import org.jdom2.output.XMLOutputter;
import org.springframework.stereotype.Service;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class SerializerService implements Serializer {

  private final EntitySerializer entitySerializer;
  private final ValueProvider valueProvider;
  private final AllFieldsProvider allFieldsProvider;
  private final BasicTypeChecker basicTypeChecker;
  private final InstanceProvider instanceProvider;
  private final ValueWriter valueWriter;

  private final ObjectMapper mapper = new ObjectMapper();
  private final ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

  public SerializerService(
      EntitySerializer entitySerializer,
      ValueProvider valueProvider,
      AllFieldsProvider allFieldsProvider,
      BasicTypeChecker basicTypeChecker,
      InstanceProvider instanceProvider,
      ValueWriter valueWriter) {
    this.entitySerializer = entitySerializer;
    this.valueProvider = valueProvider;
    this.allFieldsProvider = allFieldsProvider;
    this.basicTypeChecker = basicTypeChecker;
    this.instanceProvider = instanceProvider;
    this.valueWriter = valueWriter;
  }

  @PostConstruct
  public void init() {
    mapper.enable(SerializationFeature.INDENT_OUTPUT);
    mapper.registerModule(new JavaTimeModule());
    SimpleModule module = new SimpleModule();
    module.addSerializer(IconChooser.class, new IconChooserSerializer());
    mapper.registerModule(module);
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
    // mapper.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.NONE);
    mapper.setVisibility(PropertyAccessor.FIELD, JsonAutoDetect.Visibility.NON_PRIVATE);
    mapper.setVisibility(
        new VisibilityChecker.Std(JsonAutoDetect.Visibility.NON_PRIVATE) {
          @Override
          public boolean isFieldVisible(java.lang.reflect.Field f) {
            if (Modifier.isFinal(f.getModifiers()) || Modifier.isTransient(f.getModifiers())) {
              return false;
            }
            return super.isFieldVisible(f);
          }

          @Override
          public boolean isFieldVisible(AnnotatedField f) {
            if (Modifier.isFinal(f.getModifiers()) || Modifier.isTransient(f.getModifiers())) {
              return false;
            }
            return super.isFieldVisible(f);
          }
        });
    yamlMapper.enable(SerializationFeature.INDENT_OUTPUT);
    // Now you should use JavaTimeModule instead
    yamlMapper.registerModule(new JavaTimeModule());
    yamlMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
  }

  public Map<String, Object> fromJson(String json) throws IOException {
    if (json == null || "".equals(json)) json = "{}";
    return mapper.readValue(json, Map.class);
  }

  public <T> T fromJson(String json, Class<T> c) throws Exception {
    if (json == null || "".equals(json)) json = "{}";
    return pojoFromJson(json, c);
  }

  public <T> T pojoFromJson(String json, Class<T> c) throws Exception {
    if (json == null || json.isEmpty()) json = "{}";
    return mapper.readValue(json, c);
  }

  public String toJson(Object o) throws Exception {
    if (o != null && o.getClass().isAnnotationPresent(Entity.class)) {
      return entityToJson(o);
    }
    return mapper.writeValueAsString(o);
  }

  private String entityToJson(Object o) throws Exception {
    return toJson(entitySerializer.toMap(o));
  }

  public Map<String, Object> toMap(Object o) throws Exception {
    if (o == null) {
      return Map.of();
    }
    if (isBasic(o)) {
      return Map.of("value", o);
    }
    if (o instanceof URL url) {
      return Map.of("url", url.toString());
    }
    Map<String, Object> data = fromJson(toJson(o));
    applyAttributeNames(data, o);
    return data;
  }

  private void applyAttributeNames(Map<String, Object> data, Object o) throws Exception {
    if (o == null) {
      return;
    }
    for (Map.Entry<String, Object> e : data.entrySet()) {
      if (e.getValue() != null && e.getValue() instanceof Map) {
        applyAttributeNames(
            (Map<String, Object>) e.getValue(), valueProvider.getValue(e.getKey(), o));
      }
    }
    for (Field f : allFieldsProvider.getAllFields(o.getClass())) {
      if (data.containsKey(f.getName())
          && f.isAnnotationPresent(Attribute.class)
          && !Strings.isNullOrEmpty(f.getAnnotation(Attribute.class).value())) {
        Object v = data.get(f.getName());
        data.remove(f.getName());
        data.put(f.getAnnotation(Attribute.class).value(), v);
      }
    }
  }

  private boolean isBasic(Object o) {
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
        || type.isEnum();
  }

  public <T> T fromMap(Map<String, Object> map, Class<T> c) throws Exception {
    if (map == null) {
      return null;
    }
    String json = toJson(map);
    return pojoFromJson(json, c);
  }

  private Map<String, Object> entityToMap(Object o) throws Exception {
    return entitySerializer.toMap(o);
  }

  public Map<String, Object> fromYaml(String yaml) throws IOException {
    if (yaml == null) yaml = "";
    return yamlMapper.readValue(yaml, Map.class);
  }

  public <T> T fromYaml(String yaml, Class<T> c) throws IOException {
    if (yaml == null) yaml = "";
    return yamlMapper.readValue(yaml, c);
  }

  public String toYaml(Object o) throws IOException {
    return yamlMapper.writeValueAsString(o);
  }

  public Element toXml(Object o) {
    return toXml(o, new ArrayList<>());
  }

  public String toString(Element o) {
    return new XMLOutputter().outputString(o);
  }

  public Element toXml(Object o, List visited) {
    if (o == null) {
      return null;
    } else {
      if (!visited.contains(o)) {
        visited.add(o);
      }
      Element e = new Element(o.getClass().getSimpleName());
      e.setAttribute("className", o.getClass().getName());
      for (Field f : allFieldsProvider.getAllFields(o.getClass())) {
        try {
          Object i = valueProvider.getValue(f, o);

          if (i != null) {
            if (basicTypeChecker.isBasic(i)) {
              e.setAttribute(f.getName(), "" + i);
            } else {

              // todo: añadir casos collection y map

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

  public Object fromXml(String s) {
    if (Strings.isNullOrEmpty(s)) return null;
    else {
      try {
        Document doc = new SAXBuilder().build(new StringReader(s));

        Element root = doc.getRootElement();

        Object o = null;

        // todo: acabar

        if (root.getAttribute("className") != null
            && !Strings.isNullOrEmpty(root.getAttributeValue("className"))) {
          o = instanceProvider.newInstance(Class.forName(root.getAttributeValue("className")));

          for (Field f : allFieldsProvider.getAllFields(o.getClass())) {
            try {
              String sv = root.getAttributeValue(f.getId());

              if (sv != null) {
                if (basicTypeChecker.isBasic(f.getType())) {
                  valueWriter.setValue(
                      f, o, instanceProvider.newInstanceFromParent(f.getType(), sv));
                } else {

                  // todo: añadir casos collection y map

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
