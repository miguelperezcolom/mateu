package io.mateu.mdd.tester.app.complexCase;

import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.tester.model.customComponents.CustomComponent;
import io.mateu.mdd.tester.model.entities.embedded.WithEmbeddedEntity;
import io.mateu.mdd.tester.model.entities.relations.*;
import io.mateu.mdd.tester.model.jpql.SampleJPQLCrudView;
import io.mateu.mdd.tester.model.jpql.SampleJPQLLIstView;
import io.mateu.mdd.tester.model.jpql.SampleJPQLToPPOJOCrudView;
import io.mateu.mdd.tester.model.entities.basic.*;
import io.mateu.mdd.tester.model.pojos.SamplePPOJO;
import io.mateu.mdd.tester.model.pojos.SamplePOJO;
import io.mateu.mdd.tester.model.rpc.SampleCustomizedRPCListView;
import io.mateu.mdd.tester.model.rpc.SampleRPCListView;
import io.mateu.mdd.tester.model.rpc.SampleRPCToJPAListView;
import io.mateu.mdd.tester.model.rpc.SampleRPCToPPOJOListView;

import java.util.ArrayList;
import java.util.List;

public class MainModule extends AbstractModule {
    @Override
    public String getName() {
        return "Main module";
    }

    @Override
    public List<MenuEntry> buildMenu() {
        List<MenuEntry> m = new ArrayList<>();

        m.add(new AbstractAction("Alert") {

            @Override
            public void run(MDDExecutionContext context) {
                context.alert("Hola!");
            }

        });

        m.add(new MDDOpenCRUDAction("Actions", ActionsDemoEntity.class));

        m.add(new MDDCallMethodAction("Call method", MainModule.class, "returnsComponent"));

        m.add(new MDDOpenCustomComponentAction("Custom component", CustomComponent.class));

        m.add(new AbstractMenu("Refinements") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDOpenEditorAction("AppConfig", AppConfig.class, 1l));

                l.add(new MDDOpenCRUDAction("Styled class", StyledDemoEntity.class));

                l.add(new MDDOpenCRUDAction("Search filters", SearchFiltersDemoEntity.class));

                l.add(new MDDOpenCRUDAction("Sections", SectionDemoEntity.class));

                return l;
            }
        });


        m.add(new AbstractMenu("Field use cases") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDMenu("Fields"
                        , "Basic fields", BasicFieldsDemoEntity.class
                        , "Grid decorator", GridDecoratorDemoEntity.class
                        , "Date fields", DateTimeFieldsDemoEntity.class
                        , "Basic fields with validation", BasicFieldsWithValidationDemoEntity.class
                        , "Calculated fields", CalculatedFieldsDemoEntity.class
                        , "Enumeration field", EnumerationFieldDemoEntity.class
                        , "TextArea", TextAreaFieldDemoEntity.class
                ));


                l.add(new AbstractMenu("Relations") {
                    @Override
                    public List<MenuEntry> buildEntries() {
                        List<MenuEntry> l = new ArrayList<>();

                        l.add(new MDDMenu("One to one", "Referenced", OneToOneReferenced.class, "Referencer", OneToOneReferencer.class));

                        l.add(new MDDMenu("Many to one", "Destination", ManyToOneFieldDemoDestinationEntity.class, "Source", ManyToOneFieldDemoEntity.class));

                        l.add(new MDDMenu("One to many", "Parent", OneToManyParentEntity.class, "Children", OneToManyChildEntity.class));


                        return l;
                    }
                });


                l.add(new AbstractMenu("More relations") {
                    @Override
                    public List<MenuEntry> buildEntries() {
                        List<MenuEntry> l = new ArrayList<>();

                        l.add(new MDDMenu("Many to many", "ManyToOne", ManyToOneFieldDemoEntity.class));

                        l.add(new MDDMenu("Map", "ManyToOne", ManyToOneFieldDemoEntity.class));

                        return l;
                    }
                });

                l.add(new AbstractMenu("More relations") {
                    @Override
                    public List<MenuEntry> buildEntries() {
                        List<MenuEntry> l = new ArrayList<>();

                        l.add(new MDDOpenCRUDAction("Element collection", WithElementCollectionEntity.class));

                        l.add(new MDDOpenCRUDAction("Embedded", WithEmbeddedEntity.class));

                        return l;
                    }
                });


                return l;
            }
        });


        m.add(new AbstractMenu("JPQL") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDOpenListViewAction("Sample JPQL list view", SampleJPQLLIstView.class));

                l.add(new MDDOpenListViewAction("Sample JPQL crud view", SampleJPQLCrudView.class));

                l.add(new MDDOpenListViewAction("Sample JPQL to POJO crud view", SampleJPQLToPPOJOCrudView.class));

                return l;
            }
        });

        m.add(new AbstractMenu("Non JPA") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDOpenEditorAction("Sample POJO", SamplePOJO.class, null));


                l.add(new MDDOpenEditorAction("Sample persistent POJO", SamplePPOJO.class, null));

                return l;
            }
        });


        m.add(new AbstractMenu("Rpc") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDOpenListViewAction("Sample Rpc view", SampleRPCListView.class));

                l.add(new MDDOpenListViewAction("Sample customized Rpc view", SampleCustomizedRPCListView.class));

                l.add(new MDDOpenListViewAction("Sample Rpc to JPA entity view", SampleRPCToJPAListView.class));

                l.add(new MDDOpenListViewAction("Sample Rpc to POJO entity view", SampleRPCToPPOJOListView.class));

                return l;
            }
        });


        return m;
    }




    public static Component returnsComponent(String yourName, int age) {
        return new Label("Hello " + yourName + "!");
    }


}
