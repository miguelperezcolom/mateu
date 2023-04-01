package io.mateu.mdd.json;

import com.google.auto.service.AutoService;
import io.mateu.util.Serializer;
import io.mateu.util.persistence.EntityDeserializer;
import io.mateu.util.persistence.EntitySerializer;


@AutoService(EntityDeserializer.class)
public class MateuEntityDeserializer implements EntityDeserializer {
    @Override
    public <T> T fromJson(String json, Class<T> c) throws Exception {
        return Serializer.pojoFromJson(json, c);
    }
}
