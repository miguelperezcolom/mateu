package io.mateu;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import net.javacrumbs.jsonunit.providers.Jackson2ObjectMapperProvider;

public class ObjectMapperProvider implements Jackson2ObjectMapperProvider {

  private final ObjectMapper mapper;
  private final ObjectMapper lenientMapper;

  public ObjectMapperProvider() {
    mapper = new ObjectMapper(); // .registerModule(new JavaTimeModule());
    mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    mapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

    lenientMapper = new ObjectMapper(); // .registerModule(new JavaTimeModule());
    //        lenientMapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
    //        lenientMapper.configure(JsonParser.Feature.ALLOW_COMMENTS, true);
    //        lenientMapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
    lenientMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);
  }

  @Override
  public ObjectMapper getObjectMapper(boolean lenient) {
    return lenient ? lenientMapper : mapper;
  }
}
