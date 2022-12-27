package io.mateu.mdd.vaadin.controllers.thirdLevel;

import io.mateu.mdd.vaadin.components.views.RpcListViewComponent;
import io.mateu.mdd.vaadin.controllers.secondLevel.ListViewComponentController;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.mdd.vaadin.pojos.ModelField;

public class RpcViewFieldController extends ListViewComponentController {

    private final ModelField modelField;

    public RpcViewFieldController(ModelField modelField, RpcListViewComponent rpcListViewComponent) {
        super(rpcListViewComponent);
        this.modelField = modelField;
    }

}
