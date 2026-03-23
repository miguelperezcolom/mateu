package ${project.packageName}.infra.in.ui.pages.${aggregate.name?lower_case};

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.CrudAdapter;
import io.mateu.uidl.interfaces.HttpRequest;
import ${project.packageName}.application.out.${aggregate.name}Repository;
import ${project.packageName}.application.query.${aggregate.name}QueryService;
import ${project.packageName}.application.query.dto.${aggregate.name}Row;
import ${project.packageName}.application.usecases.${aggregate.name?lower_case}.delete.Delete${aggregate.name}Command;
import ${project.packageName}.application.usecases.${aggregate.name?lower_case}.delete.Delete${aggregate.name}UseCase;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Id;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Scope("prototype")
@RequiredArgsConstructor
public class ${aggregate.name}CrudAdapter implements CrudAdapter<
${aggregate.name}ViewModel,
${aggregate.name}ViewModel,
${aggregate.name}ViewModel,
NoFilters,
${aggregate.name}Row,
String
> {

final ${aggregate.name}ViewModel viewModel;
final Delete${aggregate.name}UseCase delete${aggregate.name}UseCase;
final ${aggregate.name}QueryService queryService;

@Override
public ListingData<${aggregate.name}Row> search(String searchText,
    NoFilters filters,
    Pageable pageable) {
    return queryService.findAll(searchText, filters, pageable);
    }

    @Override
    public void deleteAllById(List<String> selectedIds) {
        delete${aggregate.name}UseCase.handle(new Delete${aggregate.name}Command(selectedIds));
        }

        @Override
        public ${aggregate.name}ViewModel getView(String id) {
        return viewModel.load(queryService
        .getById(id)
        .orElseThrow());
        }

        @Override
        public ${aggregate.name}ViewModel getEditor(String id) {
        return viewModel.load(queryService
        .getById(id)
        .orElseThrow());
        }

        @Override
        public ${aggregate.name}ViewModel getCreationForm(HttpRequest httpRequest) {
        return viewModel;
        }
        }
