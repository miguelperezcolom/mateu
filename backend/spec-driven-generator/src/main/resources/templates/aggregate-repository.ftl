package ${project.packageName}.application.out;

import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.${aggregate.name};
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Id;

public interface ${aggregate.name}Repository extends Repository<${aggregate.name}, ${aggregate.name}Id> {
}
