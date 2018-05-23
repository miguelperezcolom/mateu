package ${package};

import ${package}.model.Person;
import com.google.common.collect.Lists;
import io.mateu.common.BaseMDDApp;
import io.mateu.ui.core.client.app.*;
import io.mateu.ui.mdd.client.MDDAction;

import java.util.List;

public class MyApp extends BaseMDDApp {
    @Override
    public String getName() {
        return "Demo app";
    }

    @Override
    public List<AbstractArea> buildAreas() {
        return Lists.newArrayList(new AbstractArea("Demo area") {
            @Override
            public List<AbstractModule> buildModules() {
                return Lists.newArrayList(new AbstractModule() {
                    @Override
                    public String getName() {
                        return "Demo module";
                    }

                    @Override
                    public List<MenuEntry> buildMenu() {
                        return Lists.newArrayList(

                                new AbstractAction("Test") {
                                    @Override
                                    public void run() {
                                        MateuUI.alert("Hola!");
                                    }
                                }

                                , new MDDAction("Persons", Person.class)

                        );
                    }
                });
            }
        });
    }
}