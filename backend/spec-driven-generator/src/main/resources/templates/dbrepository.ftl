package ${project.packageName}.infra.out.persistence;

import ${project.packageName}.application.out.${aggregate.name}Repository;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.${aggregate.name};
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Id;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Name;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

import static io.mateu.core.infra.JsonSerializer.listFromJson;
import static io.mateu.core.infra.JsonSerializer.toJson;

@Service
@RequiredArgsConstructor
public class ${aggregate.name}DBRepository implements ${aggregate.name}Repository {

final ${aggregate.name}EntityRepository repository;

@Override
public Optional<${aggregate.name}> findById(${aggregate.name}Id id) {
    return repository.findById(id.id()).map(this::toDomain);
    }

    private ${aggregate.name} toDomain(${aggregate.name}Entity entity) {
    return new ${aggregate.name}(
    new ${aggregate.name}Id(entity.id),
    new ${aggregate.name}Name(entity.name)
    );
    }

    private ${aggregate.name}Entity toEntity(${aggregate.name} ${aggregate.name?lower_case}) {
    return new ${aggregate.name}Entity(
${aggregate.name?lower_case}.getId().id(),
${aggregate.name?lower_case}.getName().name()
    );
    }

    @Override
    public ${aggregate.name}Id save(${aggregate.name} ${aggregate.name?lower_case}) {
    return new ${aggregate.name}Id(repository.save(toEntity(${aggregate.name?lower_case})).id);
    }

    @Override
    public void deleteAllById(List<${aggregate.name}Id> selectedIds) {
        repository.deleteAllById(selectedIds.stream().map(${aggregate.name}Id::id).toList());
        }
        }
