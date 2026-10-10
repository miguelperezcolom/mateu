package io.mateu.springdata.fixtures;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public final class Repositories {

  private Repositories() {}

  public interface ProductRepository
      extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {}

  public interface SupplierRepository extends JpaRepository<Supplier, Long> {}

  public interface ArticleRepository
      extends JpaRepository<Article, String>, JpaSpecificationExecutor<Article> {}
}
