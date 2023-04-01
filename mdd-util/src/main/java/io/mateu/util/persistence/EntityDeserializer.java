package io.mateu.util.persistence;

public interface EntityDeserializer {

    <T> T fromJson(String json, Class<T> c) throws Exception;

}
