package io.mateu.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.io.IOException;
import java.util.Map;

public class Serializer {

    private static ObjectMapper mapper = new ObjectMapper();
    private static ObjectMapper yamlMapper = new ObjectMapper(new YAMLFactory());

    static {
        mapper.enable(SerializationFeature.INDENT_OUTPUT);
        mapper.registerModule(new JavaTimeModule());
        mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
        yamlMapper.enable(SerializationFeature.INDENT_OUTPUT);
        // Now you should use JavaTimeModule instead
        yamlMapper.registerModule(new JavaTimeModule());
        yamlMapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }


    public static Map<String, Object> fromJson(String json) throws IOException {
        if (json == null || "".equals(json)) json = "{}";
        return mapper.readValue(json, Map.class);
    }

    public static <T> T fromJson(String json, Class<T> c) throws IOException {
        if (json == null || "".equals(json)) json = "{}";
        return mapper.readValue(json, c);
    }

    public static String toJson(Object o) throws IOException {
        return mapper.writeValueAsString(o);
    }






    public static Map<String, Object> fromYaml(String yaml) throws IOException {
        if (yaml == null) yaml = "";
        return yamlMapper.readValue(yaml, Map.class);
    }

    public static <T> T fromYaml(String yaml, Class<T> c) throws IOException {
        if (yaml == null) yaml = "";
        return yamlMapper.readValue(yaml, c);
    }

    public static String toYaml(Object o) throws IOException {
        return yamlMapper.writeValueAsString(o);
    }

}
