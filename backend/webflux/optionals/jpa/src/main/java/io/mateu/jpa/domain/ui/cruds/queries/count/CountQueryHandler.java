package io.mateu.jpa.domain.ui.cruds.queries.count;

import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.jpa.domain.ui.cruds.queries.QueryHelper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class CountQueryHandler {

  @PersistenceContext private EntityManager em;
  @Autowired ReflectionService reflectionService;

  @Transactional
  public Mono<Long> run(CountQuery query) {
    final long[] count = {0};

    try {
      Query q =
          new QueryHelper(reflectionService)
              .buildJpaQuery(
                  query,
                  em,
                  query.getSelectColumnsForCount(),
                  query.getSearchtext(),
                  query.getFilters(),
                  null,
                  null,
                  0,
                  1000,
                  false);
      log.debug(q.toString());

      Object r = q.getSingleResult();

      if (r instanceof Long) {
        count[0] = ((Long) r).longValue();
      } else if (r instanceof Object[]) {
        Object[] v = (Object[]) r;

        count[0] = ((Long) v[0]).longValue();
      }
    } catch (Throwable throwable) {
      throwable.printStackTrace();
    }

    return Mono.just(count[0]);
  }
}
