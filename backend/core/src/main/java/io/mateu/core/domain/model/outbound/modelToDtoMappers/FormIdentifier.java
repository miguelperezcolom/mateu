package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.HorizontalLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.SplitLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.VerticalLayout;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import org.springframework.stereotype.Service;

@Service
public class FormIdentifier {

    private final ReflectionHelper reflectionHelper;

    public FormIdentifier(ReflectionHelper reflectionHelper) {
        this.reflectionHelper = reflectionHelper;
    }

    public boolean isForm(Field f, Object value) {
        return !(
                Container.class.isAssignableFrom(f.getType())
                        || Crud.class.isAssignableFrom(f.getType())
                        || Card.class.equals(f.getType())
                        || Stepper.class.equals(f.getType())
                        || f.isAnnotationPresent(HorizontalLayout.class)
                        || f.isAnnotationPresent(VerticalLayout.class)
                        || f.isAnnotationPresent(SplitLayout.class)
                        || f.getType().isAnnotationPresent(HorizontalLayout.class)
                        || f.getType().isAnnotationPresent(VerticalLayout.class)
                        || f.getType().isAnnotationPresent(SplitLayout.class)
                || reflectionHelper.isBasic(f.getType())
        )
                ;
    }

}
