package io.mateu.jpa.domain.json;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.reflection.usecases.AllTransferrableFieldsProvider;
import io.mateu.core.domain.model.reflection.usecases.IdProvider;
import io.mateu.core.domain.model.reflection.usecases.ValueProvider;
import io.mateu.core.domain.model.util.persistence.EntitySerializer;
import io.mateu.uidl.data.ExternalReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import java.util.*;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Primary
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class MateuEntitySerializer implements EntitySerializer {

  private final AllTransferrableFieldsProvider allTransferrableFieldsProvider;
  private final ValueProvider valueProvider;
  private final IdProvider idProvider;

  @Override
  public Map<String, Object> toMap(Object entity) throws Exception {
    Map<String, Object> data = new HashMap<>();
    for (Field field :
        allTransferrableFieldsProvider.getAllTransferrableFields(entity.getClass())) {
      addToData(data, field, entity);
    }
    return data;
  }

  private void addToData(Map<String, Object> data, Field field, Object entity) throws Exception {
    if (field.isAnnotationPresent(OneToMany.class) || field.isAnnotationPresent(ManyToMany.class)) {
      addXToMany(data, field, entity);
      return;
    }
    if (field.isAnnotationPresent(ManyToOne.class)) {
      addManyToOne(data, field, entity);
      return;
    }
    data.put(field.getId(), valueProvider.getValue(field, entity));
  }

  private void addManyToOne(Map<String, Object> data, Field field, Object entity) throws Exception {
    Object value = valueProvider.getValue(field, entity);
    if (value == null) {
      return;
    }
    data.put(field.getId(), new ExternalReference(idProvider.getId(value), value.toString()));
  }

  private void addXToMany(Map<String, Object> data, Field field, Object entity) throws Exception {
    Collection list = (Collection) valueProvider.getValue(field, entity);
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
          value -> refs.add(new ExternalReference(idProvider.getId(value), value.toString())));
      data.put(field.getId(), refs);
    }
  }

  private Stream<CascadeType> getCascade(Field field) {
    if (field.isAnnotationPresent(OneToMany.class)) {
      return Arrays.stream(field.getAnnotation(OneToMany.class).cascade());
    }
    if (field.isAnnotationPresent(ManyToMany.class)) {
      return Arrays.stream(field.getAnnotation(ManyToMany.class).cascade());
    }
    return null;
  }
}
