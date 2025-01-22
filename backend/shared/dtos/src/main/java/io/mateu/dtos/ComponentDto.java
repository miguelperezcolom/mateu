package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.List;
import java.util.Map;

/** A common interface for componentIds */
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "componentType")
@JsonSubTypes({
  @JsonSubTypes.Type(value = GenericComponentDto.class, name = "GenericComponent"),
  @JsonSubTypes.Type(value = CrudComponentDto.class, name = "CrudComponent"),
})
public interface ComponentDto {

  ComponentMetadataDto metadata();

  String id();

  String className();

  Map<String, Object> attributes();

  Map<String, Object> data();

  List<String> childComponentIds();
}
