package io.mateu.remote.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = Form.class, name = "Form"),
  @JsonSubTypes.Type(value = Card.class, name = "Card"),
  @JsonSubTypes.Type(value = Crud.class, name = "Crud"),
  @JsonSubTypes.Type(value = Result.class, name = "Result"),
  @JsonSubTypes.Type(value = JourneyStarter.class, name = "JourneyStarter"),
  @JsonSubTypes.Type(value = JourneyRunner.class, name = "JourneyRunner")
})
public interface ViewMetadata {

  void setDataPrefix(String dataPrefix);
}