package io.mateu.mdd.ui.cruds;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;

import java.io.IOException;

public class JpaRpcCrudViewSerializer extends JsonSerializer<JpaRpcCrudView> {
    @Override
    public void serialize(JpaRpcCrudView jpaRpcCrudView, JsonGenerator jsonGenerator, SerializerProvider serializerProvider) throws IOException {
        jsonGenerator.writeStartObject();
        jsonGenerator.writeObjectField("action", jpaRpcCrudView.getAction());
        jsonGenerator.writeEndObject();
    }
}
