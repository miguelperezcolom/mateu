package io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.create;

import io.mateu.mdd.specdrivengenerator.application.out.ValueObjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.ValueObject;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateValueObjectUseCase {

    final ValueObjectRepository repository;

    public void handle(CreateValueObjectCommand command) {
        var valueobject = ValueObject.of(new ValueObjectId(command.id()), new ValueObjectName(command.name()));
        repository.save(valueobject);
    }

}
