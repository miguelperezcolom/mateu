package ${project.packageName}.application.out;

import java.util.List;
import java.util.Optional;

public interface Repository<T, IdType> {
    Optional<T> findById(IdType id);

    IdType save(T entity);

    void deleteAllById(List<IdType> selectedIds);
}
