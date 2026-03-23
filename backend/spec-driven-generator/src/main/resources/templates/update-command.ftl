package ${project.packageName}.application.usecases.${aggregate.name?lower_case}.update;

public record Update${aggregate.name}Command(String id, String name) {
}
