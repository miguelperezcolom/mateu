package io.mateu.mdd.json;

import com.google.auto.service.AutoService;
import io.mateu.mdd.shared.data.ExternalReference;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.persistence.EntityDeserializer;
import io.mateu.util.persistence.EntitySerializer;

import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.*;

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

    private void addToData(Map<String, Object> data, FieldInterfaced field, Object entity) throws Exception {
        if (field.isAnnotationPresent(OneToMany.class)) {
            addOneToMany(data, field, entity);
            return;
        }
        if (field.isAnnotationPresent(ManyToOne.class)) {
            addManyToOne(data, field, entity);
            return;
        }
        data.put(field.getId(), ReflectionHelper.getValue(field, entity));
    }

    private void addManyToOne(Map<String, Object> data, FieldInterfaced field, Object entity) throws Exception {
        Object value = ReflectionHelper.getValue(field, entity);
        if (value == null) {
            return;
        }
        data.put(field.getId(), new ExternalReference(ReflectionHelper.getId(value), value.toString()));
    }

    private void addOneToMany(Map<String, Object> data, FieldInterfaced field, Object entity) throws Exception {
        Collection list = (Collection) ReflectionHelper.getValue(field, entity);
        if (list == null) {
            return;
        }
        List<ExternalReference> refs = new ArrayList<>();
        list.forEach(value -> refs.add(new ExternalReference(ReflectionHelper.getId(value), value.toString())));
        data.put(field.getId(), refs);
    }
}
