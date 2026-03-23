package ${project.packageName}.domain.aggregates.${aggregate.name?lower_case}.vo;


public record ${aggregate.name}Name(String name) {

public ${aggregate.name}Name {
if (name == null || name.isBlank()) throw new IllegalArgumentException("name is required");
}
}
