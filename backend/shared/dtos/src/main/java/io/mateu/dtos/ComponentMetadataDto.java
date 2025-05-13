package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/** Parent interface for all component metadata types */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = FormDto.class, name = "Form"),
  @JsonSubTypes.Type(value = CrudDto.class, name = "Crud"),
  @JsonSubTypes.Type(value = ResultDto.class, name = "Result"),
  @JsonSubTypes.Type(value = MicroFrontendDto.class, name = "MicroFrontend"),
  @JsonSubTypes.Type(value = CardDto.class, name = "Card"),
  @JsonSubTypes.Type(value = DirectoryDto.class, name = "Directory"),
  @JsonSubTypes.Type(value = StepperDto.class, name = "Stepper"),
  @JsonSubTypes.Type(value = HorizontalLayoutDto.class, name = "HorizontalLayout"),
  @JsonSubTypes.Type(value = VerticalLayoutDto.class, name = "VerticalLayout"),
  @JsonSubTypes.Type(value = SplitLayoutDto.class, name = "SplitLayout"),
  @JsonSubTypes.Type(value = TabLayoutDto.class, name = "TabLayout"),
  @JsonSubTypes.Type(value = ElementDto.class, name = "Element")
})
public interface ComponentMetadataDto {}
