package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
  @JsonSubTypes.Type(value = ServerSideComponentDto.class, name = "ServerSide"),
  @JsonSubTypes.Type(value = ClientSideComponentDto.class, name = "ClientSide")
})
@Schema(oneOf = {ServerSideComponentDto.class, ClientSideComponentDto.class})
public interface ComponentDto {

  String id();

  List<ComponentDto> children();

  String style();

  String cssClasses();

  ComponentDto setStyle(String s);

  ComponentDto setSlot(String s);
}
