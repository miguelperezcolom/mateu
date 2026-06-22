package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.CrudRepository;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@UI("/catalog-filterable")
public class FilterableCatalog extends AutoCrud<FilterableCatalog.Employee> {

    @Override
    public CrudRepository<Employee> repository() {
        return new EmployeeRepository();
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Employee implements Identifiable {
        @NotEmpty
        String id;
        @NotEmpty
        @Filterable
        String name;
        @Filterable
        String department;
        double salary;

        @Override
        public String id() { return id; }

        @Override
        public String toString() { return name; }
    }

    static class EmployeeRepository implements CrudRepository<Employee> {
        private static final Map<String, Employee> db = new HashMap<>(Map.of(
                "e1", new Employee("e1", "Alice", "Engineering", 80000),
                "e2", new Employee("e2", "Bob", "Marketing", 65000),
                "e3", new Employee("e3", "Carol", "Engineering", 90000)
        ));

        @Override
        public Optional<Employee> findById(String id) {
            return Optional.ofNullable(db.get(id));
        }

        @Override
        public String save(Employee entity) {
            db.put(entity.getId(), entity);
            return entity.getId();
        }

        @Override
        public List<Employee> findAll() {
            return db.values().stream().toList();
        }

        @Override
        public void deleteAllById(List<String> ids) {
            ids.forEach(db::remove);
        }
    }
}
