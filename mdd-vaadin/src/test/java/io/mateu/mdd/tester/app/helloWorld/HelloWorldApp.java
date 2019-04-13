package io.mateu.mdd.tester.app.helloWorld;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.annotations.SubApp;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.app.simpleCase.SubMenu;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;
import io.mateu.mdd.tester.model.entities.groups.Person;
import io.mateu.mdd.tester.model.useCases.pojos.Calculator;
import io.mateu.mdd.vaadinport.vaadin.components.fieldBuilders.AbstractFieldBuilder;

import java.io.IOException;
import java.util.List;

public class HelloWorldApp extends SimpleMDDApplication {

    @Action
    public AbstractAction people() {

        return new MDDOpenCRUDAction(Person.class);

    }

}
