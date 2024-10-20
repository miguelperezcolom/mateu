package io.mateu.jpa.domain.ui.cruds.queries.rows;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.shared.annotations.Status;
import io.mateu.dtos.SortCriteria;
import io.mateu.dtos.SortType;
import io.mateu.dtos.StatusType;
import io.mateu.jpa.domain.ui.cruds.queries.QueryHelper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.util.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

@Service
@Slf4j
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class RowsQueryHandler {

  private static final String successStatuses = "active,on,true,success";
  private static final String infoStatuses = "info";
  private static final String warningStatuses = "warning";
  private static final String dangerStatuses = "inactive,off,false,danger,fail";

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
                  query.getSearchtext(),
                  query.getFilters(),
                  toSortOrders(query.getPageable().getSort()),
                  null,
                  (int) query.getPageable().getOffset(),
                  query.getPageable().toLimit().max(),
                  true);

      return Flux.fromStream(
          q.getResultList().stream()
              .map(raw -> toMap(query, (Object[]) raw, query.getColumnFields())));
    } catch (Exception e) {
      return Flux.error(e);
    }
  }

  private List<SortCriteria> toSortOrders(Sort sort) {
    return sort.stream()
        .map(
            s ->
                new SortCriteria(
                    s.getProperty(), s.isDescending() ? SortType.Descending : SortType.Ascending))
        .toList();
  }

  private Map toMap(RowsQuery query, Object[] values, List<Field> columnFields) {
    Map map = new HashMap();
    if (values != null) {
      for (int i = 0; i < values.length && i < columnFields.size() + 1; i++) {
        map.put("col" + i, toValue(values[i], i == 0 ? null : columnFields.get(i - 1)));
      }
    }
    return map;
  }

  private Object toValue(Object value, Field field) {
    if (value == null) {
      return null;
    }
    if (field != null && field.isAnnotationPresent(Status.class)) {
      Status statusAnnotation = field.getAnnotation(Status.class);
      return new io.mateu.dtos.Status(getStatusType(statusAnnotation, "" + value), "" + value);
    }
    if (reflectionHelper.isBasic(value.getClass())) {
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
