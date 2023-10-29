package io.mateu.mdd.ui.cruds;

import com.google.common.base.Strings;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.interfaces.JpaRpcCrudFactory;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.interfaces.JpaCrud;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
@RequiredArgsConstructor
public class JpaRpcCrudViewFactory implements JpaRpcCrudFactory {

  final ReflectionHelper reflectionHelper;

  @Override
  public Listing create(Object parentEntity, FieldInterfaced field) throws Exception {
    MDDOpenCRUDAction action = new MDDOpenCRUDAction(field.getGenericClass());
    if (field.isAnnotationPresent(OneToMany.class)
        && !Strings.isNullOrEmpty(field.getAnnotation(OneToMany.class).mappedBy())) {
      action.setExtraFilters(
          new ExtraFilters(
              "x." + field.getAnnotation(OneToMany.class).mappedBy() + " = :p", "p", parentEntity));
    } else if (field.isAnnotationPresent(ManyToMany.class)
        && !Strings.isNullOrEmpty(field.getAnnotation(ManyToMany.class).mappedBy())) {
      action.setExtraFilters(
          new ExtraFilters(
              "x." + field.getAnnotation(ManyToMany.class).mappedBy() + " = :p",
              "p",
              parentEntity));
    } else {
      action.setExtraFilters(
          new ExtraFilters("x in :p", "p", reflectionHelper.getValue(field, parentEntity)));
    }
    return new JpaRpcCrudView(action);
  }

  @Override
  public Listing create(JpaCrud v) throws Exception {
    MDDOpenCRUDAction a = new MDDOpenCRUDAction(v.getEntityClass());
    if (v != null && v.getColumnFields() != null)
      a.setColumns(String.join(",", v.getColumnFields()));
    if (v != null && v.getVisibleFields() != null)
      a.setFields(String.join(",", v.getVisibleFields()));
    if (v != null && v.getSearchFilterFields() != null)
      a.setFilters(String.join(",", v.getSearchFilterFields()));
    if (v != null && v.getReadOnlyFields() != null)
      a.setReadOnlyFields(String.join(",", v.getReadOnlyFields()));
    if (v != null) a.setCanAdd(v.canAdd());
    if (v != null) a.setCanDelete(v.canDelete());
    if (v != null) a.setReadOnly(v.isReadOnly());
    if (v != null && !Strings.isNullOrEmpty(v.getExtraWhereFilter()))
      a.setQueryFilters(v.getExtraWhereFilter());
    return new JpaRpcCrudView(a);
  }
}
