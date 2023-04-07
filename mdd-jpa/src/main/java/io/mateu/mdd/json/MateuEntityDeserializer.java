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

import java.lang.reflect.InvocationTargetException;
import java.util.Map;


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
        return instance;
    }
}
