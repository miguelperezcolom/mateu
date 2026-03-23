package ${project.packageName}.application.usecases.${aggregate.name?lower_case}.update;

import ${project.packageName}.application.out.${aggregate.name}Repository;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Id;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Name;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class Update${aggregate.name}UseCase {

final ${aggregate.name}Repository repository;

@Transactional
public void handle(Update${aggregate.name}Command command) {
var ${aggregate.name?lower_case} = repository.findById(new ${aggregate.name}Id(Long.valueOf(command.id()))).orElseThrow();
${aggregate.name?lower_case}.update(new ${aggregate.name}Name(command.name()));
repository.save(${aggregate.name?lower_case});
}

}
