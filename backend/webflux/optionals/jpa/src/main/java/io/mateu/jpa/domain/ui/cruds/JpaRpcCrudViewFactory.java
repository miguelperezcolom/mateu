package io.mateu.jpa.domain.ui.cruds;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.uidl.app.MDDOpenCRUDAction;
import io.mateu.uidl.interfaces.JpaCrud;
import io.mateu.uidl.interfaces.JpaRpcCrudFactory;
import io.mateu.uidl.interfaces.Listing;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

@Service
@Primary
@RequiredArgsConstructor
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class JpaRpcCrudViewFactory implements JpaRpcCrudFactory {

  final ReflectionService reflectionService;

  @Override
  public Listing create(JpaCrud v) throws Exception {
    MDDOpenCRUDAction a = new MDDOpenCRUDAction(v.getEntityClass());
    if (v.getColumnFields() != null) a.setColumns(String.join(",", v.getColumnFields()));
    if (v.getVisibleFields() != null) a.setFields(String.join(",", v.getVisibleFields()));
    if (v.getSearchFilterFields() != null)
      a.setFilters(String.join(",", v.getSearchFilterFields()));
    if (v.getReadOnlyFields() != null) a.setReadOnlyFields(String.join(",", v.getReadOnlyFields()));
    a.setCanAdd(v.canAdd());
    a.setCanDelete(v.canDelete());
    a.setReadOnly(v.isReadOnly());
    if (!Strings.isNullOrEmpty(v.getExtraWhereFilter())) a.setQueryFilters(v.getExtraWhereFilter());
    var jpaRpcCrudView = reflectionService.newInstance(JpaRpcCrudView.class);
    jpaRpcCrudView.setAction(a);
    return jpaRpcCrudView;
  }
}
