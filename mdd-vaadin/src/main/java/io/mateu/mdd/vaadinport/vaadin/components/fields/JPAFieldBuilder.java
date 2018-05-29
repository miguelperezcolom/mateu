package io.mateu.mdd.vaadinport.vaadin.components.fields;

import com.google.common.collect.Lists;
import com.vaadin.data.Binder;
import com.vaadin.ui.Layout;
import com.vaadin.ui.TextField;
import io.mateu.mdd.core.reflection.FieldInterfaced;

import java.util.List;
import java.util.Map;

public class JPAFieldBuilder {

    static List<JPAFieldBuilder> builders = Lists.newArrayList(
            new JPAStringFieldBuilder()
            , new JPAIntegerFieldBuilder()
            , new JPALongFieldBuilder()
            , new JPADoubleFieldBuilder()
            , new JPABooleanFieldBuilder()
    );

    public boolean isSupported(FieldInterfaced field) {
        for (JPAFieldBuilder b : builders) if (b.isSupported(field)) {
            return true;
        }
        return false;
    }

    public void build(FieldInterfaced field, Object object, Layout container, Binder binder) {

        for (JPAFieldBuilder b : builders) if (b.isSupported(field)) {
            b.build(field, object, container, binder);
            break;
        }

    }

}
