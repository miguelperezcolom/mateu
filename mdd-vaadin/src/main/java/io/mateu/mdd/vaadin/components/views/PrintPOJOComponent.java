package io.mateu.mdd.vaadin.components.views;

import com.vaadin.ui.FormLayout;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

import javax.persistence.Version;
import java.util.List;
import java.util.stream.Collectors;

public class PrintPOJOComponent extends FormLayout {
    public PrintPOJOComponent(Object bean) {




        getAllFields(bean.getClass()).forEach(f -> {

            Object v = null;
            try {
                v = ReflectionHelper.getValue(f, bean);
            } catch (Exception e) {
                Notifier.alert(e);
            }

            Label l;
            addComponent(l = new Label((v != null)?v.toString():""));
            l.setCaption(ReflectionHelper.getCaption(f));

        });


    }


    private List<FieldInterfaced> getAllFields(Class beanType) {
        List<FieldInterfaced> allFields = ReflectionHelper.getAllFields(beanType);

        allFields = allFields.stream().filter((f) ->
                !(f.isAnnotationPresent(Version.class) || f.isAnnotationPresent(Ignored.class))
        ).collect(Collectors.toList());

        return allFields;
    }
}
