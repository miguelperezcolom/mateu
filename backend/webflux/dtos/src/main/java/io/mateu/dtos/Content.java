package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "contentType")
@JsonSubTypes({
  @JsonSubTypes.Type(value = SingleComponent.class, name = "SingleComponent"),
  @JsonSubTypes.Type(value = View.class, name = "View"),
})
public interface Content {}
