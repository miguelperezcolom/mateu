package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = FormDto.class, name = "Form"),
  @JsonSubTypes.Type(value = CrudlDto.class, name = "Crudl"),
  @JsonSubTypes.Type(value = AppDto.class, name = "App")
})
@Schema(oneOf = {FormDto.class, CrudlDto.class, AppDto.class})
public interface PageMainContentDto extends ComponentDto {

  String id();

  List<ComponentDto> children();

  String style();

  String cssClasses();

  PageMainContentDto setStyle(String s);

  PageMainContentDto addStyle(String s);

  PageMainContentDto setSlot(String s);
}
