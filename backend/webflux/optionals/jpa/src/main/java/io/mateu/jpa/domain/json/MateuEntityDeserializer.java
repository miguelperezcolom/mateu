package io.mateu.jpa.domain.json;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.core.domain.model.util.persistence.EntityDeserializer;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class MateuEntityDeserializer implements EntityDeserializer {

  final SerializerService serializerService;
  final ReflectionService reflectionService;

  @Override
  public <T> T fromJson(EntityManager em, String json, Class<T> c) throws Exception {
    Map<String, Object> map = serializerService.fromJson(json);
    T instance = reflectionService.newInstance(c);
    // T instance = serializer.pojoFromJson(json, c);
    reflectionService.getAllEditableFields(c).stream()
        .filter(
            f ->
                !f.isAnnotationPresent(OneToOne.class)
                    && !f.isAnnotationPresent(ManyToOne.class)
                    && !f.isAnnotationPresent(OneToMany.class)
                    && !f.isAnnotationPresent(ElementCollection.class)
                    && !f.isAnnotationPresent(ManyToMany.class))
        .forEach(
            f -> {
              try {
                reflectionService.setValue(
                    f,
                    instance,
                    serializerService.fromJson(
                        serializerService.toJson(map.get(f.getId())), f.getType()));
              } catch (Throwable ignored) {
              }
            });

    reflectionService.getAllEditableFields(c).stream()
        .filter(
            f -> f.isAnnotationPresent(OneToOne.class) || f.isAnnotationPresent(ManyToOne.class))
        .forEach(
            f -> {
              try {
                reflectionService.setValue(
                    f,
                    instance,
                    em.find(f.getType(), ((Map<String, Object>) map.get(f.getId())).get("value")));
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
    reflectionService.getAllEditableFields(c).stream()
        .filter(
            f -> f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class))
        .forEach(
            f -> {
              try {
                reflectionService.setValue(f, instance, buildList(f, em, map));
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
    reflectionService.getAllEditableFields(c).stream()
        .filter(f -> f.isAnnotationPresent(ElementCollection.class))
        .forEach(
            f -> {
              try {
                reflectionService.setValue(f, instance, buildElementList(f, map));
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
    return instance;
  }

  private Object buildElementList(Field f, Map<String, Object> map) {
    List<Object> data = (List<Object>) map.get(f.getId());
    List value = new ArrayList();
    if (data != null) {
      value.addAll(
          data.stream()
              .map(
                  m -> {
                    if (f.getGenericClass().isEnum()) {
                      return Enum.valueOf((Class<? extends Enum>) f.getGenericClass(), "" + m);
                    } else {
                      return m;
                    }
                  })
              .collect(Collectors.toList()));
    }
    return value;
  }

  private Object buildList(Field f, EntityManager em, Map<String, Object> map) {
    List<Map<String, Object>> data = (List<Map<String, Object>>) map.get(f.getId());
    List value = new ArrayList();
    if (data != null) {
      value.addAll(
          data.stream()
              .map(m -> em.find(f.getGenericClass(), m.get("value")))
              .collect(Collectors.toList()));
    }
    return value;
  }
}
