package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

/**
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = FormDto.class, name = "Form"),
  @JsonSubTypes.Type(value = CrudlDto.class, name = "Crudl"),
  @JsonSubTypes.Type(value = AppDto.class, name = "App")
})
@Schema(oneOf = {FormDto.class, CrudlDto.class, AppDto.class})
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public interface PageMainContentDto extends ComponentDto {

  String id();

  List<ComponentDto> children();

  String style();

  String cssClasses();

  PageMainContentDto setStyle(String s);

  PageMainContentDto addStyle(String s);

  PageMainContentDto setSlot(String s);
}
