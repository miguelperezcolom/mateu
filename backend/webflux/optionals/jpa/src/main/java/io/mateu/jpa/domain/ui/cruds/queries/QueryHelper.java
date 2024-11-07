package io.mateu.jpa.domain.ui.cruds.queries;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.SortCriteria;
import io.mateu.dtos.SortType;
import io.mateu.uidl.core.annotations.*;
import jakarta.persistence.*;
import java.lang.reflect.InvocationTargetException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class QueryHelper {

  final ReflectionService reflectionService;

  public jakarta.persistence.Query buildJpaQuery(
      io.mateu.jpa.domain.ui.cruds.queries.Query query,
      EntityManager em,
      String selectedColumns,
      String searchText,
      Object filters,
      List<SortCriteria> sortOrders,
      String groupClause,
      int offset,
      int limit,
      boolean addOrderClause)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

    Class entityClass = query.getAction().getEntityClass();

    Map<String, Object> parameterValues = new HashMap<>();
    String w = "";
    w = buildWhereClause(query, filters, entityClass, parameterValues);

    // SELECT f from Student f LEFT JOIN f.classTbls s WHERE s.ClassName = 'abc' <=== ejemplo left
    // outer join

    String jpql = "select " + selectedColumns + " from " + entityClass.getName() + " x ";

    for (String c : query.getAlias().keySet()) {
      jpql += " left join " + c + " " + query.getAlias().get(c);
    }

    if (!"".equals(w)) jpql += " where " + w;

    if (!Strings.isNullOrEmpty(groupClause)) jpql += " " + groupClause + " ";

    if (addOrderClause) {
      String oc = "";
      if (sortOrders != null)
        for (SortCriteria qso : sortOrders) {
          if (!SortType.None.equals(qso.getOrder())) {
            if (!Strings.isNullOrEmpty(qso.getColumn())) {
              if (!"".equals(oc)) oc += ", ";
              oc +=
                  qso.getColumn()
                      + " "
                      + ((SortType.Descending.equals(qso.getOrder())) ? "desc" : "asc");
            }
          }
        }
      List<Field> orderCols = new ArrayList<>();
      for (Field f : reflectionService.getAllFields(entityClass)) {
        if (f.isAnnotationPresent(Order.class)) orderCols.add(f);
      }
      Collections.sort(
          orderCols, Comparator.comparingInt(f -> f.getAnnotation(Order.class).priority()));
      for (Field f : orderCols) {
        if (query.getAliasedColumnNames().get(f.getName()) != null) {
          if (!"".equals(oc)) oc += ", ";
          oc +=
              query.getAliasedColumnNames().get(f.getName())
                  + " "
                  + (f.getAnnotation(Order.class).desc() ? "desc" : "asc");
        }
      }

      if ("".equals(oc) && query.getColumnNames().size() > 1) {
        var colName = query.getColumnNames().get(1);
        if (Strings.isNullOrEmpty(colName)) {
          colName = "1";
        }
        oc += colName + " desc";
      }
      if (!"".equals(oc)) jpql += " order by " + oc;
    }

    log.info(jpql);
    jakarta.persistence.Query q = em.createQuery(jpql).setFirstResult(offset).setMaxResults(limit);
    parameterValues.forEach(q::setParameter);
    return q;
  }

  private String buildWhereClause(
      io.mateu.jpa.domain.ui.cruds.queries.Query query,
      Object filters,
      Class entityClass,
      Map<String, Object> parameterValues)
      throws NoSuchMethodException, IllegalAccessException, InvocationTargetException {

    String ql = "";

    try {
      updateExtraFilters();
    } catch (Exception e) {
      e.printStackTrace();
    }

    if (!Strings.isNullOrEmpty(query.getQueryFilters())) {

      if (!"".equals(ql)) ql += " and ";

      ql += query.getQueryFilters();
    }

    if (query.getExtraFilters() != null && !Strings.isNullOrEmpty(query.getExtraFilters().ql())) {

      if (!"".equals(ql)) ql += " and ";

      ql += query.getExtraFilters().ql();

      if (query.getExtraFilters().parameters() != null)
        parameterValues.putAll(query.getExtraFilters().parameters());
    }

    if (filters == null) return ql;

    List<Field> allFields = query.getFilterFields();

    allFields =
        allFields.stream()
            .filter(
                (f) ->
                    !(f.isAnnotationPresent(Version.class)
                        || f.isAnnotationPresent(Ignored.class)
                        || (f.isAnnotationPresent(Id.class)
                            && f.isAnnotationPresent(GeneratedValue.class)
                            && !f.isAnnotationPresent(MainSearchFilter.class)
                            && !f.isAnnotationPresent(SearchFilter.class))))
            .collect(Collectors.toList());

    // todo: contemplar caso varias anotaciones @SearchFilter para un mismo campo

    if (!Strings.isNullOrEmpty(query.getSearchtext())) {

      var stringFields =
          reflectionService.getAllEditableFields(entityClass).stream()
              .filter(field -> String.class.equals(field.getType()))
              .collect(Collectors.toList());

      if (stringFields.size() > 0) {
        if (!"".equals(ql)) ql += " and ";
        String or = "";
        for (Field stringField : stringFields) {
          if (!"".equals(or)) {
            or += " or ";
          }
          or +=
              " lower(x."
                  + stringField.getName()
                  + (stringField.isAnnotationPresent(LiteralSearchFilter.class) ? ".es" : "")
                  + ") like :"
                  + "_searchtext"
                  + " ";
        }
        ql += "(" + or + ")";
        parameterValues.put("_searchtext", "%" + query.getSearchtext().toLowerCase() + "%");
      }
    }

    for (Field f : allFields) {

      Object v = reflectionService.getValue(f, filters);

      if (v != null) {

        Field ef = reflectionService.getFieldByName(entityClass, f.getName());

        if (ef != null && ef.getType().isAnnotationPresent(UseIdToSelect.class)) {

          boolean anadir = !String.class.equals(v.getClass()) || !Strings.isNullOrEmpty((String) v);

          if (anadir) {
            Field idf = reflectionService.getIdField(entityClass);

            if (!"".equals(ql)) ql += " and ";
            ql += " x." + f.getName() + "." + idf.getName() + " = :" + f.getName() + " ";
            parameterValues.put(f.getName(), v);
          }

        } else if (String.class.equals(v.getClass())) {

          String s = (String) v;

          if (!Strings.isNullOrEmpty(s)) {
            if (!"".equals(ql)) ql += " and ";
            ql +=
                " lower(x."
                    + f.getName()
                    + (f.isAnnotationPresent(LiteralSearchFilter.class) ? ".es" : "")
                    + ") like :"
                    + f.getName()
                    + " ";
            parameterValues.put(f.getName(), "%" + ((String) v).toLowerCase() + "%");
          }
        } else if (Boolean.class.equals(v.getClass()) || boolean.class.equals(v.getClass())) {

          boolean b = (Boolean) v;

          if (!"".equals(ql)) ql += " and ";

          if (!b) ql += " not ";

          ql += " x." + f.getName() + " ";

          if (b) ql += " = true ";

        } else if (Integer.class.equals(v.getClass())
            || int.class.equals(v.getClass())
            || Long.class.equals(v.getClass())
            || long.class.equals(v.getClass())
            || Double.class.equals(v.getClass())
            || double.class.equals(v.getClass())) {

          String fname = f.getName();
          if (fname.endsWith("From")) fname = fname.substring(0, fname.lastIndexOf("From"));
          if (fname.endsWith("To")) fname = fname.substring(0, fname.lastIndexOf("To"));
          if (fname.endsWith("Value")) fname = fname.substring(0, fname.lastIndexOf("Value"));

          if (!"".equals(ql)) ql += " and ";
          ql +=
              " x."
                  + fname
                  + " "
                  + (f.getName().endsWith("From")
                      ? ">="
                      : (f.getName().endsWith("To") ? "<=" : "="))
                  + " :"
                  + f.getName()
                  + " ";
          parameterValues.put(f.getName(), v);

        } else if (LocalDate.class.equals(v.getClass())
            || LocalDateTime.class.equals(v.getClass())
            || Date.class.equals(v.getClass())) {

          String fname = f.getName();
          if (fname.endsWith("From")) fname = fname.substring(0, fname.lastIndexOf("From"));
          if (fname.endsWith("To")) fname = fname.substring(0, fname.lastIndexOf("To"));

          if (!"".equals(ql)) ql += " and ";
          ql +=
              " x."
                  + fname
                  + " "
                  + ((f.getName().endsWith("From")) ? ">=" : "<=")
                  + " :"
                  + f.getName()
                  + " ";
          parameterValues.put(f.getName(), v);

        } else if (v instanceof Map && f.isAnnotationPresent(ManyToOne.class)) {
          v = ((Map) v).get("value");
          Field idField = reflectionService.getIdField(f.getType());

          if (!"".equals(ql)) ql += " and ";
          ql +=
              " x."
                  + f.getName()
                  + "."
                  + idField.getId()
                  + " = :"
                  + f.getName()
                  + "_"
                  + idField.getId()
                  + " ";
          parameterValues.put(f.getName() + "_" + idField.getId(), v);

        } else {

          if (!"".equals(ql)) ql += " and ";
          ql += " x." + f.getName() + " = :" + f.getName() + " ";
          parameterValues.put(f.getName(), v);
        }
      }
    }

    return ql;
  }

  public void updateExtraFilters() {}
}
