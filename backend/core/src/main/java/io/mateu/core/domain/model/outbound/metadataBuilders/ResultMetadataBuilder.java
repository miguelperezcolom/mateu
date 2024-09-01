package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.dtos.Destination;
import io.mateu.dtos.DestinationType;
import io.mateu.dtos.Result;
import io.mateu.dtos.ResultType;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ResultMetadataBuilder {

  public Result build(io.mateu.core.domain.uidefinition.shared.data.Result result) {
    return new Result(
        ResultType.valueOf(result.getType().toString()),
        result.getMessage(),
        result.getInterestingLinks() != null
            ? result.getInterestingLinks().stream()
                .map(
                    l ->
                        new Destination(
                            DestinationType.valueOf(l.getType().toString()),
                            l.getDescription(),
                            l.getValue()))
                .toList()
            : List.of(),
        result.getNowTo() != null
            ? new Destination(
                DestinationType.valueOf(result.getNowTo().getType().toString()),
                result.getNowTo().getDescription(),
                result.getNowTo().getValue())
            : null,
        result.getLeftSideImageUrl());
  }
}
