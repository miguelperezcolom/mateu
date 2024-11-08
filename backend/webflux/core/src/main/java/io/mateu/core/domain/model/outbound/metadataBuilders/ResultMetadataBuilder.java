package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.dtos.Destination;
import io.mateu.dtos.DestinationType;
import io.mateu.dtos.Result;
import io.mateu.dtos.ResultType;
import org.springframework.stereotype.Service;

@Service
public class ResultMetadataBuilder {

  private final ServerSideObjectMapper serverSideObjectMapper;

  public ResultMetadataBuilder(ServerSideObjectMapper serverSideObjectMapper) {
    this.serverSideObjectMapper = serverSideObjectMapper;
  }

  public Result build(io.mateu.uidl.data.Result result) {
    return new Result(
        result.title(),
        ResultType.valueOf(result.type().toString()),
        result.message(),
        result.interestingLinks().stream()
            .map(
                l ->
                    new Destination(
                        l.id(), DestinationType.valueOf(l.type().toString()), l.description()))
            .toList(),
        result.nowTo() != null
            ? new Destination(
                result.nowTo().id(),
                DestinationType.valueOf(result.nowTo().type().toString()),
                result.nowTo().description())
            : null,
        result.leftSideImageUrl(),
        serverSideObjectMapper.toDto(result.actionHandler()));
  }
}
