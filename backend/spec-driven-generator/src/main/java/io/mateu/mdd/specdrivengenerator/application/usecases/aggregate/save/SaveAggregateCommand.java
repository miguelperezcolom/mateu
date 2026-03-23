package io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.save;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.FieldDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantDto;

public record SaveAggregateCommand(String id, String name,
                                   java.util.List<FieldDto> fields,
                                   java.util.List<InvariantDto> invariants) {

}
