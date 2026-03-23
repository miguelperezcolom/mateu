package ${project.packageName}.infra.out.persistence;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import ${project.packageName}.application.query.${aggregate.name}QueryService;
import ${project.packageName}.application.query.dto.${aggregate.name}Dto;
import ${project.packageName}.application.query.dto.${aggregate.name}Row;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Id;
import ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo.${aggregate.name}Name;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

import static io.mateu.core.infra.JsonSerializer.listFromJson;


@Service
@RequiredArgsConstructor
public class ${aggregate.name}DBQueryService implements ${aggregate.name}QueryService {

final ${aggregate.name}EntityRepository repository;

private ${aggregate.name}Row toDomain(${aggregate.name}Entity entity) {
return new ${aggregate.name}Row(
entity.id.toString(),
entity.name
);
}

@Override
public String getLabel(String id) {
return repository.findById(Long.valueOf(id)).map(${aggregate.name}Entity::getName).orElse("Unknown");
}

@Override
public Optional<${aggregate.name}Dto> getById(String id) {
    return repository.findById(Long.valueOf(id)).map(this::toDto);
    }

    private ${aggregate.name}Dto toDto(${aggregate.name}Entity entity) {
    return new ${aggregate.name}Dto(
    entity.id.toString(),
    entity.name
    );
    }

    @Override
    public ListingData<${aggregate.name}Row> findAll(String searchText,
        Object filters, Pageable pageable) {
        var page = repository.findAllByNameContainingIgnoreCase(searchText, org.springframework.data.domain.Pageable
        .ofSize(pageable.size())
        .withPage(pageable.page())
        );
        return new ListingData(new Page(searchText, page.getSize(), page.getNumber(), page.getTotalElements(),
        page.getContent().stream().map(this::toDomain).toList()));
        }

        }