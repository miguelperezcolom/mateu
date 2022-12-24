package io.mateu.mdd.vaadin.controllers.thirdLevel;

import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.ModelField;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.notification.Notifier;

import java.lang.reflect.InvocationTargetException;
import java.util.Collection;

public class CollectionController extends Controller {

    private final ModelField field;
    private Collection collection;

    public CollectionController(ModelField field) {
        this.field = field;
        try {
            this.collection = (Collection) ReflectionHelper.getValue(field.getField(), field.getInstance());
        } catch (Exception e) {
            Notifier.alert(e);
        }
    }


    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (!"".equals(cleanStep)) {
            return collection.stream().filter(e -> getId(e).toString().equals(step)).findFirst().get();
        }
        return null;
    }

    private Object getId(Object e) {
        return ReflectionHelper.getId(e);
    }
}
