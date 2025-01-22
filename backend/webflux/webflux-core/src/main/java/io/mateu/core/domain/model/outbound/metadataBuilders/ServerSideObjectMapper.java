package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.dtos.ServerSideObjectDto;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

@Service
public class ServerSideObjectMapper {

  private final SerializerService serializerService;

  public ServerSideObjectMapper(SerializerService serializerService) {
    this.serializerService = serializerService;
  }

  @SneakyThrows
  public ServerSideObjectDto toDto(Object object) {
    if (object == null) {
      return null;
    }
    return new ServerSideObjectDto(object.getClass().getName(), serializerService.toMap(object));
  }
}
