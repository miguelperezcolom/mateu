package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.dtos.Destination;
import io.mateu.dtos.DestinationType;
import io.mateu.dtos.Result;
import io.mateu.dtos.ResultType;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResultMetadataBuilder {

  public Result build(io.mateu.core.domain.uidefinition.shared.data.Result result) {
    return new Result(
            "",
            ResultType.valueOf(result.getType().toString()),
            result.getMessage(),
            result.getInterestingLinks() != null
                    ? result.getInterestingLinks().stream()
                    .map(
                            l ->
                                    Destination.builder()
                                            .type(DestinationType.valueOf(l.getType().toString()))
                                            .description(l.getDescription())
                                            .value(l.getValue())
                                            .build())
                    .toList()
                    : List.of(),
            result.getNowTo() != null
                    ? Destination.builder()
                    .type(DestinationType.valueOf(result.getNowTo().getType().toString()))
                    .description(result.getNowTo().getDescription())
                    .value(result.getNowTo().getValue())
                    .build()
                    : null,
            result.getLeftSideImageUrl()
    );
  }
}
