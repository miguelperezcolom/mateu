package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.core.domain.model.util.Serializer;
import io.mateu.dtos.ServerSideObject;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;

@Service
public class ServerSideObjectMapper {

  private final Serializer serializer;

  public ServerSideObjectMapper(Serializer serializer) {
    this.serializer = serializer;
  }

  @SneakyThrows
  public ServerSideObject toDto(Object object) {
    if (object == null) {
      return null;
    }
    return new ServerSideObject(object.getClass().getName(), serializer.toMap(object));
  }
}
