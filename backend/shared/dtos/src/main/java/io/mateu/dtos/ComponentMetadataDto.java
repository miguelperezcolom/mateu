package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

/** Parent interface for all component metadata types */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = FormDto.class, name = "Form"),
  @JsonSubTypes.Type(value = AppDto.class, name = "App"),
  @JsonSubTypes.Type(value = CrudlDto.class, name = "Crud"),
  @JsonSubTypes.Type(value = ResultDto.class, name = "Result"),
  @JsonSubTypes.Type(value = MicroFrontendDto.class, name = "MicroFrontend"),
  @JsonSubTypes.Type(value = CardDto.class, name = "Card"),
  @JsonSubTypes.Type(value = DirectoryDto.class, name = "Directory"),
  @JsonSubTypes.Type(value = StepperDto.class, name = "Stepper"),
  @JsonSubTypes.Type(value = HorizontalLayoutDto.class, name = "HorizontalLayout"),
  @JsonSubTypes.Type(value = VerticalLayoutDto.class, name = "VerticalLayout"),
  @JsonSubTypes.Type(value = SplitLayoutDto.class, name = "SplitLayout"),
  @JsonSubTypes.Type(value = MasterDetailLayoutDto.class, name = "MasterDetailLayout"),
  @JsonSubTypes.Type(value = TabLayoutDto.class, name = "TabLayout"),
  @JsonSubTypes.Type(value = TabDto.class, name = "Tab"),
  @JsonSubTypes.Type(value = AccordionLayoutDto.class, name = "AccordionLayout"),
  @JsonSubTypes.Type(value = AccordionPanelDto.class, name = "AccordionPanel"),
  @JsonSubTypes.Type(value = FormLayoutDto.class, name = "FormLayout"),
  @JsonSubTypes.Type(value = ScrollerDto.class, name = "Scroller"),
  @JsonSubTypes.Type(value = FullWidthDto.class, name = "FullWidth"),
  @JsonSubTypes.Type(value = ContainerDto.class, name = "Container"),
  @JsonSubTypes.Type(value = ElementDto.class, name = "Element"),
  @JsonSubTypes.Type(value = FormFieldDto.class, name = "FormField"),
  @JsonSubTypes.Type(value = TextDto.class, name = "Text")
})
public interface ComponentMetadataDto {}
