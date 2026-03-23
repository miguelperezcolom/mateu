package ${project.packageName}.application.usecases.${aggregate.name?lower_case}.delete;

import ${project.packageName}.application.out.${aggregate.name}Repository;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Id;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class Delete${aggregate.name}UseCase {

final ${aggregate.name}Repository repository;

@Transactional
public void handle(Delete${aggregate.name}Command command) {
repository.deleteAllById(command.ids().stream()
.map(Long::valueOf)
.map(${aggregate.name}Id::new)
.toList());
}

}
