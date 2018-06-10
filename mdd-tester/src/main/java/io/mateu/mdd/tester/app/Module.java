package io.mateu.mdd.tester.app;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.tester.model.basic.*;
import io.mateu.mdd.tester.model.relations.OneToOneReferenced;
import io.mateu.mdd.tester.model.relations.OneToOneReferencer;

import java.util.ArrayList;
import java.util.List;

public class Module extends AbstractModule {
    @Override
    public String getName() {
        return "Module";
    }

    @Override
    public List<MenuEntry> buildMenu() {
        List<MenuEntry> m = new ArrayList<>();

        m.add(new AbstractAction("Alert") {
            @Override
            public void run() {
                MDD.alert("Hola!");
            }
        });

        m.add(new MDDOpenEditorAction("AppConfig", AppConfig.class, 1l));

        m.add(new MDDAction("Basic fields", BasicFieldsDemoEntity.class));

        m.add(new MDDAction("Basic fields with validation", BasicFieldsWithValidationDemoEntity.class));

        m.add(new MDDAction("Calculated fields", CalculatedFieldsDemoEntity.class));

        m.add(new MDDAction("Styled class", StyledDemoEntity.class));

        m.add(new MDDAction("Actions", ActionsDemoEntity.class));

        m.add(new MDDAction("Search filters", SearchFiltersDemoEntity.class));

        m.add(new MDDAction("Sections", SectionDemoEntity.class));

        m.add(new AbstractMenu("Field use cases") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDMenu("Fields", "Enumeration field", EnumerationFieldDemoEntity.class, "TextArea", TextAreaFieldDemoEntity.class));

                l.add(new MDDMenu("@OneToOne", "Referenced", OneToOneReferenced.class, "Referencer", OneToOneReferencer.class));

                l.add(new MDDMenu("Relations", "@ManyToOne", ManyToOneFieldDemoEntity.class));

                l.add(new MDDMenu("@Owned", "ManyToOne", ManyToOneFieldDemoEntity.class));

                return l;
            }
        });


        return m;
    }

}
