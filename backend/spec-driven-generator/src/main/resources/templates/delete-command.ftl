package ${project.packageName}.application.usecases.${aggregate.name?lower_case}.delete;

import java.util.List;

public record Delete${aggregate.name}Command(List<String> ids) {
    }
