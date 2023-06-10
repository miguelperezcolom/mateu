package io.mateu.mdd.ui.cruds.queries.rows;

import io.mateu.mdd.shared.annotations.Status;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.mdd.ui.cruds.queries.QueryHelper;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.StatusType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import reactor.core.publisher.Flux;

import java.util.*;

@Service
@Slf4j
public class RowsQueryHandler {

    private final String successStatuses = "active,on,true,success";
    private final String infoStatuses = "info";
    private final String warningStatuses = "warning";
    private final String dangerStatuses = "inactive,off,false,danger";

    @PersistenceContext
    private EntityManager em;

    @Transactional
    public Flux run(RowsQuery query) {
        try {
            jakarta.persistence.Query q = new QueryHelper().buildJpaQuery(query, em,
                    query.getSelectColumnsForList(), query.getFilters(),
                    query.getSortOrders(), null,
                    query.getOffset(), query.getLimit(), true);

            return Flux.fromStream(q.getResultList().stream().map(raw -> toMap(query, (Object[]) raw, query.getColumnFields())));
        } catch (Exception e) {
            return Flux.error(e);
        }
    }

    private Map toMap(RowsQuery query, Object[] values, List<FieldInterfaced> columnFields) {
        Map map = new HashMap();
        if (values != null) {
            for (int i = 0; i < values.length; i++) {
                map.put("col" + i, toValue(values[i], i == 0?null:columnFields.get(i - 1)));
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
            return new io.mateu.remote.dtos.Status(getStatusType(statusAnnotation, "" + value), "" + value);
        }
        if (ReflectionHelper.isBasico(value.getClass())) {
            return value;
        }
        return "" + value;
    }

    private StatusType getStatusType(Status statusAnnotation, String value) {
        if (statusAnnotation.valuesForSuccess().contains(value) || successStatuses.contains(value)) {
            return StatusType.SUCCESS;
        }
        if (statusAnnotation.valuesForDanger().contains(value) || dangerStatuses.contains(value)) {
            return StatusType.DANGER;
        }
        if (statusAnnotation.valuesForWarning().contains(value) || warningStatuses.contains(value)) {
            return StatusType.WARNING;
        }
        if (statusAnnotation.valuesForInfo().contains(value) || infoStatuses.contains(value)) {
            return StatusType.INFO;
        }
        return StatusType.NONE;
    }

}
