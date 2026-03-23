package io.mateu.mdd.specdrivengenerator.application.usecases.valueobject.delete;

import io.mateu.mdd.specdrivengenerator.application.out.ValueObjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteValueObjectUseCase {

    final ValueObjectRepository repository;

    public void handle(DeleteValueObjectCommand command) {
        repository.deleteAllById(command.ids().stream().map(ValueObjectId::new).toList());
    }

}
