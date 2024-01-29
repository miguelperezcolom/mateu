package io.mateu.core.domain.model.metadataBuilders;

import io.mateu.remote.dtos.Destination;
import io.mateu.remote.dtos.DestinationType;
import io.mateu.remote.dtos.Result;
import io.mateu.remote.dtos.ResultType;
import org.springframework.stereotype.Service;

@Service
public class ResultMetadataBuilder {

  public Result build(io.mateu.mdd.shared.data.Result result) {
    return Result.builder()
        .resultType(ResultType.valueOf(result.getType().toString()))
        .message(result.getMessage())
        .interestingLinks(
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
                : null)
        .nowTo(
            result.getNowTo() != null
                ? Destination.builder()
                    .type(DestinationType.valueOf(result.getNowTo().getType().toString()))
                    .description(result.getNowTo().getDescription())
                    .value(result.getNowTo().getValue())
                    .build()
                : null)
            .leftSideImageUrl(result.getLeftSideImageUrl())
        .build();
  }
}
