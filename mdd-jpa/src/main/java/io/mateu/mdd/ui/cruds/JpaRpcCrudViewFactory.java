package io.mateu.mdd.ui.cruds;

import com.google.common.base.Strings;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.interfaces.JpaRpcCrudFactory;
import io.mateu.mdd.core.views.ExtraFilters;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import org.springframework.stereotype.Service;

@Service
public class JpaRpcCrudViewFactory implements JpaRpcCrudFactory {

    @Override
    public Listing create(Object parentEntity, FieldInterfaced field) throws Exception {
        MDDOpenCRUDAction action = new MDDOpenCRUDAction(field.getGenericClass());
        if (field.isAnnotationPresent(OneToMany.class)
                && !Strings.isNullOrEmpty(field.getAnnotation(OneToMany.class).mappedBy())) {
            action.setExtraFilters(new ExtraFilters(
                    "x." + field.getAnnotation(OneToMany.class).mappedBy() + " = :p",
                    "p", parentEntity));
        } else if (field.isAnnotationPresent(ManyToMany.class)
                    && !Strings.isNullOrEmpty(field.getAnnotation(ManyToMany.class).mappedBy())) {
                action.setExtraFilters(new ExtraFilters(
                        "x." + field.getAnnotation(ManyToMany.class).mappedBy() + " = :p",
                        "p", parentEntity));
        } else {
            action.setExtraFilters(new ExtraFilters(
                    "x in :p",
                    "p", ReflectionHelper.getValue(field, parentEntity)));
        }
        return new JpaRpcCrudView(action);
    }

}
