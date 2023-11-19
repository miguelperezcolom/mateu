package io.mateu.mdd.json;

import com.google.auto.service.AutoService;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import io.mateu.util.persistence.EntityDeserializer;
import jakarta.persistence.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MateuEntityDeserializer implements EntityDeserializer {
    
    final Serializer serializer;
    final ReflectionHelper reflectionHelper;
    
  @Override
  public <T> T fromJson(EntityManager em, String json, Class<T> c) throws Exception {
    Map<String, Object> map = serializer.fromJson(json);
    T instance = reflectionHelper.newInstance(c);
    //T instance = serializer.pojoFromJson(json, c);
    reflectionHelper.getAllEditableFields(c).stream().filter(f ->
                    !f.isAnnotationPresent(OneToOne.class)
            && !f.isAnnotationPresent(ManyToOne.class)
                            && !f.isAnnotationPresent(OneToMany.class)
                            && !f.isAnnotationPresent(ManyToMany.class)
            ).forEach(f -> {
        try {
            reflectionHelper.setValue(f, instance, serializer.fromJson(serializer.toJson(map.get(f.getId())), f.getType()));
        } catch (Exception ignored) {
        }
    });

    reflectionHelper.getAllEditableFields(c).stream()
        .filter(f -> f.isAnnotationPresent(OneToOne.class) || f.isAnnotationPresent(ManyToOne.class))
        .forEach(
            f -> {
              try {
                reflectionHelper.setValue(
                    f,
                    instance,
                    em.find(f.getType(), ((Map<String, Object>) map.get(f.getId())).get("value")));
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
    reflectionHelper.getAllEditableFields(c).stream()
        .filter(
            f -> f.isAnnotationPresent(OneToMany.class) || f.isAnnotationPresent(ManyToMany.class))
        .forEach(
            f -> {
              try {
                reflectionHelper.setValue(f, instance, buildList(f, em, map));
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
    return instance;
  }

  private Object buildList(FieldInterfaced f, EntityManager em, Map<String, Object> map) {
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
