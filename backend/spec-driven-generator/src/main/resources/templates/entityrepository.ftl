package ${project.packageName}.infra.out.persistence;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ${aggregate.name}EntityRepository extends JpaRepository<${aggregate.name}Entity, Long> {
Page<${aggregate.name}Entity> findAllByNameContainingIgnoreCase(String searchText, Pageable pageable);
    }
