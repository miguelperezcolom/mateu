package io.mateu.mdd.vaadin.controllers.thirdLevel;

import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.ModelField;

public class FieldController extends Controller {

    private final ModelField modelField;

    public FieldController(ModelField modelField) {
        this.modelField = modelField;
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        return null;
    }
}
