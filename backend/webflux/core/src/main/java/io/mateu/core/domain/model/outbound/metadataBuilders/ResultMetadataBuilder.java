package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.dtos.DestinationDto;
import io.mateu.dtos.DestinationTypeDto;
import io.mateu.dtos.ResultDto;
import io.mateu.dtos.ResultTypeDto;
import org.springframework.stereotype.Service;

@Service
public class ResultMetadataBuilder {

  private final ServerSideObjectMapper serverSideObjectMapper;

  public ResultMetadataBuilder(ServerSideObjectMapper serverSideObjectMapper) {
    this.serverSideObjectMapper = serverSideObjectMapper;
  }

  public ResultDto build(io.mateu.uidl.data.Result result) {
    return new ResultDto(
        result.title(),
        ResultTypeDto.valueOf(result.type().toString()),
        result.message(),
        result.interestingLinks().stream()
            .map(
                l ->
                    new DestinationDto(
                        l.id(),
                        DestinationTypeDto.valueOf(l.type().toString()),
                        l.description(),
                        l.value()))
            .toList(),
        result.nowTo() != null
            ? new DestinationDto(
                result.nowTo().id(),
                DestinationTypeDto.valueOf(result.nowTo().type().toString()),
                result.nowTo().description(),
                result.nowTo().value())
            : null,
        result.leftSideImageUrl(),
        serverSideObjectMapper.toDto(result.actionHandler()));
  }
}
