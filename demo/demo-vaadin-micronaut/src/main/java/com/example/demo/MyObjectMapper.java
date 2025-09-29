package com.example.demo;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import io.micronaut.context.annotation.Primary;
import io.micronaut.context.annotation.Replaces;
import io.micronaut.core.annotation.NonNull;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.core.type.Argument;
import io.micronaut.json.JsonStreamConfig;
import io.micronaut.json.tree.JsonNode;
import io.micronaut.serde.jackson.JacksonJsonMapper;
import io.micronaut.serde.jackson.JacksonObjectMapper;
import io.micronaut.serde.jackson.SerdeJacksonConfiguration;
import jakarta.inject.Singleton;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

@Singleton
@Replaces(JacksonJsonMapper.class)
@Primary
public class MyObjectMapper implements JacksonObjectMapper {

    ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules().disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

    @Override
    public @NonNull JacksonObjectMapper cloneWithConfiguration(@NonNull SerdeJacksonConfiguration jacksonConfiguration) {
        return this;
    }

    @Override
    public <T> T readValueFromTree(@NonNull JsonNode tree, @NonNull Argument<T> type) throws IOException {
        throw new RuntimeException("Not implemented");
    }

    @Override
    public <T> T readValue(@NonNull InputStream inputStream, @NonNull Argument<T> type) throws IOException {
        return objectMapper.readValue(inputStream, type.getType());
    }

    @Override
    public <T> T readValue(byte @NonNull [] byteArray, @NonNull Argument<T> type) throws IOException {
        return objectMapper.readValue(byteArray, type.getType());
    }

    @Override
    public @NonNull JsonNode writeValueToTree(@Nullable Object value) throws IOException {
        throw new RuntimeException("Not implemented");
    }

    @Override
    public @NonNull <T> JsonNode writeValueToTree(@NonNull Argument<T> type, @Nullable T value) throws IOException {
        throw new RuntimeException("Not implemented");
    }

    @Override
    public void writeValue(@NonNull OutputStream outputStream, @Nullable Object object) throws IOException {
        objectMapper.writeValue(outputStream, object);
    }

    @Override
    public <T> void writeValue(@NonNull OutputStream outputStream, @NonNull Argument<T> type, @Nullable T object) throws IOException {
        objectMapper.writeValue(outputStream, object);
    }

    @Override
    public byte[] writeValueAsBytes(@Nullable Object object) throws IOException {
        return objectMapper.writeValueAsBytes(object);
    }

    @Override
    public <T> byte[] writeValueAsBytes(@NonNull Argument<T> type, @Nullable T object) throws IOException {
        return objectMapper.writeValueAsBytes(object);
    }

    @Override
    public @NonNull JsonStreamConfig getStreamConfig() {
        throw new RuntimeException("Not implemented");
    }
}
