package io.mateu.mdd.json;

import com.google.auto.service.AutoService;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.persistence.EntitySerializer;
import jakarta.persistence.CascadeType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.util.*;
import java.util.stream.Stream;

@AutoService(EntitySerializer.class)
public class MateuEntitySerializer implements EntitySerializer {

  @Override
  public Map<String, Object> toMap(Object entity) throws Exception {
    Map<String, Object> data = new HashMap<>();
    for (FieldInterfaced field : ReflectionHelper.getAllTransferrableFields(entity.getClass())) {
      addToData(data, field, entity);
    }
    return data;
  }

  private void addToData(Map<String, Object> data, FieldInterfaced field, Object entity)
      throws Exception {
    if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {
      addXToMany(data, field, entity);
      return;
    }
    if (field.isAnnotationPresent(ManyToOne.class)) {
      addManyToOne(data, field, entity);
      return;
    }
    data.put(field.getId(), ReflectionHelper.getValue(field, entity));
  }

  private void addManyToOne(Map<String, Object> data, FieldInterfaced field, Object entity)
      throws Exception {
    Object value = ReflectionHelper.getValue(field, entity);
    if (value == null) {
      return;
    }
    data.put(field.getId(), new ExternalReference(ReflectionHelper.getId(value), value.toString()));
  }

  private void addXToMany(Map<String, Object> data, FieldInterfaced field, Object entity)
      throws Exception {
    Collection list = (Collection) ReflectionHelper.getValue(field, entity);
    if (list == null) {
      return;
    }
    if (getCascade(field).filter(c -> c.equals(CascadeType.ALL)).count() > 0) {
      List<Map> items = new ArrayList<>();
      list.forEach(
          value -> {
            try {
              items.add(toMap(value));
            } catch (Exception e) {
              e.printStackTrace();
            }
          });
      data.put(field.getId(), items);
    } else {
      List<ExternalReference> refs = new ArrayList<>();
      list.forEach(
          value ->
              refs.add(new ExternalReference(ReflectionHelper.getId(value), value.toString())));
      data.put(field.getId(), refs);
    }
  }

  private Stream<CascadeType> getCascade(FieldInterfaced field) {
    if (field.isAnnotationPresent(OneToMany.class)) {
      return Arrays.stream(field.getAnnotation(OneToMany.class).cascade());
    }
    if (field.isAnnotationPresent(ManyToMany.class)) {
      return Arrays.stream(field.getAnnotation(ManyToMany.class).cascade());
    }
    return null;
  }
}