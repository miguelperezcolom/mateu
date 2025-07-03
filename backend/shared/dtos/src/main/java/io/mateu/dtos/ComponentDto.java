package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = ServerSideComponentDto.class, name = "ServerSide"),
  @JsonSubTypes.Type(value = ClientSideComponentDto.class, name = "ClientSide")
})
public interface ComponentDto {

  String id();

  List<ComponentDto> children();

  String style();

  String cssClasses();
}
