package io.mateu.core.domain.queries;

import com.google.common.base.Strings;
import io.mateu.mdd.shared.data.Value;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class EntitiesFinder {

  @PersistenceContext EntityManager em;

  public List<Value> findEntities(Class entityClass, String searchText, int page, int pageSize) {
    FieldInterfaced idField = ReflectionHelper.getIdField(entityClass);
    FieldInterfaced nameField = ReflectionHelper.getNameField(entityClass, false);
    String jpql =
        "select x."
            + idField.getId()
            + ", x."
            + nameField.getId()
            + " from "
            + entityClass.getName()
            + " x ";
    if (!Strings.isNullOrEmpty(searchText)) {
      jpql += " where lower(x." + nameField.getId() + ") like :s ";
    }
    jpql += " order by x." + nameField.getId() + " asc";
    Query query = em.createQuery(jpql).setFirstResult(page * pageSize).setMaxResults(pageSize);
    if (!Strings.isNullOrEmpty(searchText)) {
      query.setParameter("s", "%" + searchText.toLowerCase().replaceAll("'", "''") + "%");
    }
    return (List<Value>)
        query.getResultList().stream()
            .map(m -> new Value((String) ((Object[]) m)[1], ((Object[]) m)[0]))
            .collect(Collectors.toList());
  }

  public int countEntities(Class entityClass, String searchText) {
    FieldInterfaced nameField = ReflectionHelper.getNameField(entityClass, false);
    String jpql = "select count(x) from " + entityClass.getName() + " x ";
    if (!Strings.isNullOrEmpty(searchText)) {
      jpql += " where lower(x." + nameField.getId() + ") like :s ";
    }
    Query query = em.createQuery(jpql);
    if (!Strings.isNullOrEmpty(searchText)) {
      query.setParameter("s", "%" + searchText.toLowerCase().replaceAll("'", "''") + "%");
    }
    return Math.toIntExact((Long) query.getSingleResult());
  }
}
