package io.mateu.mdd.vaadinport.vaadin.components.views;

import com.vaadin.ui.FormLayout;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;

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
                MDD.alert(e);
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
