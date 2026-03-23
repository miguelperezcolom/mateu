package ${project.packageName}.infra.in.ui.suppliers;

import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import ${project.packageName}.application.query.${aggregate.name}QueryService;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Id;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ${aggregate.name}IdLabelSupplier implements LabelSupplier {

final ${aggregate.name}QueryService queryService;

@Override
public String label(Object id, HttpRequest httpRequest) {
return queryService.getLabel((String) id);
}
}
