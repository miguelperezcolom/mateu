package io.mateu.test;

import io.mateu.mdd.core.annotations.Repository;
import io.mateu.mdd.core.interfaces.IRepository;
import io.mateu.test.model.Entidad;

@Repository
public interface MyRepository extends IRepository<Entidad, Long> {
}
