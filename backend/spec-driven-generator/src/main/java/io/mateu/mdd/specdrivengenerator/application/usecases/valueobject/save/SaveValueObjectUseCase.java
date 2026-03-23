package io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.save;

import io.mateu.mdd.specdrivengenerator.application.out.ValueObjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaveValueObjectUseCase {

    final ValueObjectRepository repository;

    public void handle(SaveValueObjectCommand command) {
        var role = repository.findById(new ValueObjectId(command.id())).orElseThrow();
        role.update(new ValueObjectName(command.name()));
        repository.save(role);
    }

}
