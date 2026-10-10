package io.mateu.springdata;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.persistence.EntityManager;
import org.springframework.core.ResolvableType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * Factory of {@link JpaCrudStore}s:
 *
 * <pre>{@code
 * public interface ProductRepository
 *     extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {}
 *
 * @UI("/products")
 * public class Products extends AutoCrud<Product> {
 *   @Autowired ProductRepository repository;
 *
 *   @Override
 *   public CrudStore<Product> store() {
 *     return CrudStores.of(repository);
 *   }
 * }
 * }</pre>
 *
 * The entity and id types are read from the repository's {@code JpaRepository<T, ID>} declaration.
 */
@Experimental("new in 3.0; the search and summary semantics may still be refined")
public final class CrudStores {

  private CrudStores() {}

  /** A store whose search runs in the database; listing totals are computed in memory. */
  public static <
          T extends Identifiable, ID, R extends JpaRepository<T, ID> & JpaSpecificationExecutor<T>>
      JpaCrudStore<T, ID> of(R repository) {
    var types = ResolvableType.forClass(repository.getClass()).as(JpaRepository.class);
    @SuppressWarnings("unchecked")
    var entityClass = (Class<T>) types.getGeneric(0).resolve();
    @SuppressWarnings("unchecked")
    var idClass = (Class<ID>) types.getGeneric(1).resolve();
    if (entityClass == null || idClass == null) {
      throw new IllegalArgumentException(
          "Cannot tell the entity and id types of "
              + repository.getClass().getName()
              + " — use new JpaCrudStore<>(repository, repository, Entity.class, Id.class)");
    }
    return new JpaCrudStore<>(repository, repository, entityClass, idClass);
  }

  /** Same, with the listing totals ({@code @Aggregate}/{@code @GroupBy}) run in the database. */
  public static <
          T extends Identifiable, ID, R extends JpaRepository<T, ID> & JpaSpecificationExecutor<T>>
      JpaCrudStore<T, ID> of(R repository, EntityManager entityManager) {
    JpaCrudStore<T, ID> store = of(repository);
    return store.withEntityManager(entityManager);
  }
}
