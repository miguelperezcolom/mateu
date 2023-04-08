package io.mateu.mdd.json;

import com.google.auto.service.AutoService;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import io.mateu.util.persistence.EntityDeserializer;
import io.mateu.util.persistence.EntitySerializer;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;

import java.lang.reflect.InvocationTargetException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@AutoService(EntityDeserializer.class)
public class MateuEntityDeserializer implements EntityDeserializer {
    @Override
    public <T> T fromJson(EntityManager em, String json, Class<T> c) throws Exception {
        Map<String, Object> map = Helper.fromJson(json);
        T instance = Serializer.pojoFromJson(json, c);
        ReflectionHelper.getAllEditableFields(c).stream().filter(f -> f.isAnnotationPresent(ManyToOne.class))
                .forEach(f -> {
                    try {
                        ReflectionHelper.setValue(f, instance, em.find(f.getType(),
                                ((Map<String, Object>) map.get(f.getId())).get("value")));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                });
        ReflectionHelper.getAllEditableFields(c).stream().filter(f -> f.isAnnotationPresent(OneToMany.class))
                .forEach(f -> {
                    try {
                        ReflectionHelper.setValue(f, instance, buildList(f, em, map));
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
            value.addAll(data.stream().map(m -> em.find(f.getGenericClass(),
                    m.get("value")))
                    .collect(Collectors.toList()));
        }
        return value;
    }
}
