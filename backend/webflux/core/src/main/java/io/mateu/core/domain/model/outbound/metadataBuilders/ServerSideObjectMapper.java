package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.dtos.ServerSideObject;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

@Service
public class ServerSideObjectMapper {

  private final SerializerService serializerService;

  public ServerSideObjectMapper(SerializerService serializerService) {
    this.serializerService = serializerService;
  }

  @SneakyThrows
  public ServerSideObject toDto(Object object) {
    if (object == null) {
      return null;
    }
    return new ServerSideObject(object.getClass().getName(), serializerService.toMap(object));
  }
}
