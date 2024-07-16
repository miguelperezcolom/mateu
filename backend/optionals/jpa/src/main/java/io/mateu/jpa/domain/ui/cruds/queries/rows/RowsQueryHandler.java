package io.mateu.jpa.domain.ui.cruds.queries.rows;

import io.mateu.core.domain.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.annotations.Status;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import io.mateu.jpa.domain.ui.cruds.queries.QueryHelper;
import io.mateu.remote.dtos.StatusType;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

@Service
@Slf4j
public class RowsQueryHandler {

  private final String successStatuses = "active,on,true,success";
  private final String infoStatuses = "info";
  private final String warningStatuses = "warning";
  private final String dangerStatuses = "inactive,off,false,danger,fail";

  @PersistenceContext private EntityManager em;
  @Autowired ReflectionHelper reflectionHelper;

  @Transactional
  public Flux run(RowsQuery query) {
    try {
      jakarta.persistence.Query q =
          new QueryHelper(reflectionHelper)
              .buildJpaQuery(
                  query,
                  em,
                  query.getSelectColumnsForList(),
                  query.getFilters(),
                  query.getSortOrders(),
                  null,
                  query.getOffset(),
                  query.getLimit(),
                  true);

      return Flux.fromStream(
          q.getResultList().stream()
              .map(raw -> toMap(query, (Object[]) raw, query.getColumnFields())));
    } catch (Exception e) {
      return Flux.error(e);
    }
  }

  private Map toMap(RowsQuery query, Object[] values, List<FieldInterfaced> columnFields) {
    Map map = new HashMap();
    if (values != null) {
      for (int i = 0; i < values.length && i < columnFields.size() + 1; i++) {
        map.put("col" + i, toValue(values[i], i == 0 ? null : columnFields.get(i - 1)));
      }
    }
    return map;
  }

  private Object toValue(Object value, FieldInterfaced field) {
    if (value == null) {
      return null;
    }
    if (field != null && field.isAnnotationPresent(Status.class)) {
      Status statusAnnotation = field.getAnnotation(Status.class);
      return new io.mateu.remote.dtos.Status(
          getStatusType(statusAnnotation, "" + value), "" + value);
    }
    if (ReflectionHelper.isBasico(value.getClass())) {
      return value;
    }
    return "" + value;
  }

  private StatusType getStatusType(Status statusAnnotation, String value) {
    if (value == null) {
      return StatusType.NONE;
    }
    String normalizedValue = value.toLowerCase();
    if (statusAnnotation.valuesForSuccess().contains(normalizedValue)
        || successStatuses.contains(normalizedValue)) {
      return StatusType.SUCCESS;
    }
    if (statusAnnotation.valuesForDanger().contains(normalizedValue)
        || dangerStatuses.contains(normalizedValue)) {
      return StatusType.DANGER;
    }
    if (statusAnnotation.valuesForWarning().contains(normalizedValue)
        || warningStatuses.contains(normalizedValue)) {
      return StatusType.WARNING;
    }
    if (statusAnnotation.valuesForInfo().contains(normalizedValue)
        || infoStatuses.contains(normalizedValue)) {
      return StatusType.INFO;
    }
    return StatusType.NONE;
  }
}
