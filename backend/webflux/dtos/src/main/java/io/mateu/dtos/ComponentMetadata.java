package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/** Parent interface for all component metadata types */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = Form.class, name = "Form"),
  @JsonSubTypes.Type(value = Crud.class, name = "Crud"),
  @JsonSubTypes.Type(value = Result.class, name = "Result"),
  @JsonSubTypes.Type(value = MicroFrontend.class, name = "JourneyStarter"),
  @JsonSubTypes.Type(value = Card.class, name = "Card"),
  @JsonSubTypes.Type(value = Directory.class, name = "Directory"),
  @JsonSubTypes.Type(value = Stepper.class, name = "Stepper"),
  @JsonSubTypes.Type(value = HorizontalLayout.class, name = "HorizontalLayout"),
  @JsonSubTypes.Type(value = VerticalLayout.class, name = "VerticalLayout"),
  @JsonSubTypes.Type(value = SplitLayout.class, name = "SplitLayout"),
  @JsonSubTypes.Type(value = TabLayout.class, name = "TabLayout"),
  @JsonSubTypes.Type(value = Element.class, name = "Element")
})
public interface ComponentMetadata {}
