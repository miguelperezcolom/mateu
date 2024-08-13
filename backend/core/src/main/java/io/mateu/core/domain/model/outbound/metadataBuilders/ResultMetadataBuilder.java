package io.mateu.core.domain.model.outbound.metadataBuilders;

import io.mateu.dtos.Destination;
import io.mateu.dtos.DestinationType;
import io.mateu.dtos.Result;
import io.mateu.dtos.ResultType;
import org.springframework.stereotype.Service;

@Service
public class ResultMetadataBuilder {

  public Result build(io.mateu.core.domain.uidefinition.shared.data.Result result) {
    return new Result(
        "",
        ResultType.valueOf(result.type().toString()),
        result.message(),
        result.interestingLinks().stream()
            .map(
                l ->
                    new Destination(
                        DestinationType.valueOf(l.type().toString()),
                        l.description(),
                        l.value()))
            .toList(),
        result.nowTo() != null
            ? new Destination(
                DestinationType.valueOf(result.nowTo().type().toString()),
                result.nowTo().description(),
                result.nowTo().value())
            : null,
        result.leftSideImageUrl());
  }
}
