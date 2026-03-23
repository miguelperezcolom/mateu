package ${project.packageName}.application.usecases.${aggregate.name?lower_case}.create;

import ${project.packageName}.application.out.${aggregate.name}Repository;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.${aggregate.name};
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Id;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Name;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class Create${aggregate.name}UseCase {

final ${aggregate.name}Repository repository;

@Transactional
public String handle(Create${aggregate.name}Command command) {
return repository.save(${aggregate.name}.of(new ${aggregate.name}Name(command.name()))
).id().toString();
}

}
