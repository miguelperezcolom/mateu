package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "contentType")
@JsonSubTypes({
  @JsonSubTypes.Type(value = SingleComponentDto.class, name = "SingleComponent"),
  @JsonSubTypes.Type(value = ViewDto.class, name = "View"),
})
public interface ContentDto {}
