package ${project.packageName}.domain.aggregates.${aggregate.name?lower_case};


import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.workflow.ddd.AggregateRoot;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Id;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Name;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@NoArgsConstructor@AllArgsConstructor
@Getter
public class ${aggregate.name} extends AggregateRoot {

${aggregate.name}Id id;

${aggregate.name}Name name;


public static ${aggregate.name} of(${aggregate.name}Name name) {
${aggregate.name} p = new ${aggregate.name}();
p.name = name;
return p;
}

public void update(${aggregate.name}Name name) {
this.name = name;
}

            }
