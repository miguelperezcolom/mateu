package io.mateu.mdd.tester.app.complexCase;

import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.model.authentication.User;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.tester.model.callMethods.Caller;
import io.mateu.mdd.tester.model.customComponents.CustomComponent;
import io.mateu.mdd.tester.model.entities.dynamicContent.WithDynamicContent;
import io.mateu.mdd.tester.model.entities.embedded.WithEmbeddedEntity;
import io.mateu.mdd.tester.model.entities.groups.Person;
import io.mateu.mdd.tester.model.entities.relations.*;
import io.mateu.mdd.tester.model.entities.specialFields.FileFieldEntity;
import io.mateu.mdd.tester.model.entities.specialFields.MultilanguageFieldEntity;
import io.mateu.mdd.tester.model.entities.specialFields.WeekdaysFieldEntity;
import io.mateu.mdd.tester.model.entities.subclassed.Superclass;
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
import io.mateu.mdd.tester.model.wizards.Wizard1Page1;
import io.mateu.mdd.tester.model.wizards.WizardEntity;

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

        m.add(new AbstractMenu("Call methods") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new AbstractAction("Alert") {

                    @Override
                    public void run(MDDExecutionContext context) {
                        context.alert("Hola!");
                    }

                });

                l.add(new MDDOpenCRUDAction("As actions", ActionsDemoEntity.class));

                l.add(new MDDCallMethodAction("Returns void", Caller.class, "doSomething"));

                l.add(new MDDCallMethodAction("Returns int", Caller.class, "returnInt"));

                l.add(new MDDCallMethodAction("Returns String", Caller.class, "returnString"));

                l.add(new MDDCallMethodAction("Returns Vaadin Component", Caller.class, "returnsComponent"));

                l.add(new MDDCallMethodAction("Returns POJO (read only)", Caller.class, "returnsReadOnlyPojo"));

                l.add(new MDDCallMethodAction("Returns POJO (editable)", Caller.class, "returnsDefaultEditablePojo"));

                l.add(new MDDCallMethodAction("Returns entity", Caller.class, "returnsEntity"));

                l.add(new MDDCallMethodAction("Long running method", Caller.class, "longRunning"));

                l.add(new MDDCallMethodAction("Throws exception", Caller.class, "throwsException"));

                l.add(new MDDCallMethodAction("Throws exception 2", Caller.class, "throwsException2"));

                l.add(new MDDCallMethodAction("Non-existent method", Caller.class, "thisMethodDoesNotExist"));


                l.add(new MDDCallMethodAction("Returns URL", Caller.class, "returnURL"));

                l.add(new MDDCallMethodAction("Returns URL in IFRAME", Caller.class, "returnURLInIframe"));



                //todo: acabar de aquí hacia abajo





                l.add(new MDDCallMethodAction("Returns list", Caller.class, "returnsList"));

                l.add(new MDDCallMethodAction("Returns query", Caller.class, "returnsQuery"));

                //l.add(new MDDCallMethodAction("Returns query", Caller::returnsQuery));

                l.add(new MDDCallMethodAction("Returns open list action", Caller.class, "returnsOpenListViewAction"));

                l.add(new MDDCallMethodAction("Returns list view", Caller.class, "returnsListView"));




                l.add(new MDDCallMethodAction("Returns list as report", Caller.class, "returnsListAsReport"));

                l.add(new MDDCallMethodAction("Returns query as report", Caller.class, "returnsQueryAsReport"));

                l.add(new MDDCallMethodAction("Returns list view as report", Caller.class, "returnsListViewAsReport"));



                //todo acabar hasta aquí


                return l;
            }
        });

        m.add(new AbstractMenu("Wizards") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDOpenWizardAction("As an action", Wizard1Page1.class));

                l.add(new MDDOpenCRUDAction("As a field editor", WizardEntity.class));

                l.add(new MDDCallMethodAction("As a return value", Caller.class, "returnWizard"));

                return l;
            }
        });

        m.add(new MDDOpenCustomComponentAction("Custom component", CustomComponent.class));

        m.add(new AbstractMenu("Styling") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDOpenEditorAction("AppConfig", AppConfig.class, 1l));

                l.add(new MDDOpenCRUDAction("Styled class", StyledDemoEntity.class));

                l.add(new MDDOpenCRUDAction("Grid decorator", GridDecoratorDemoEntity.class));

                l.add(new MDDOpenCRUDAction("Sections", SectionDemoEntity.class));

                return l;
            }
        });


        m.add(new AbstractMenu("Fields") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new MDDMenu("Fields"
                        , "Basic fields", BasicFieldsDemoEntity.class
                        , "Date fields", DateTimeFieldsDemoEntity.class
                        , "Money fields", MoneyFieldsDemoEntity.class
                        , "Basic fields with validation", BasicFieldsWithValidationDemoEntity.class
                        , "Calculated fields", CalculatedFieldsDemoEntity.class
                        , "Enumeration field", EnumerationFieldDemoEntity.class
                        , "TextArea", TextAreaFieldDemoEntity.class
                        , "Search filters", SearchFiltersDemoEntity.class
                        , "File field", FileFieldEntity.class
                        , "Multilanguage", MultilanguageFieldEntity.class
                        , "URL", URLFieldDemoEntity.class
                        , "IFrame", IFrameFieldDemoEntity.class
                        , "Html", HtmlFieldDemoEntity.class
                        , "Code", CodeFieldDemoEntity.class
                        , "Signature", SignatureFieldDemoEntity.class
                        , "Editable image", FileFieldEntity.class
                        , "Dynamic content", WithDynamicContent.class
                        , "Tabs", TabsDemoEntity.class
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

                        l.add(new MDDMenu("Many to many", "A side", ManyToManyASideEntity.class, "B side", ManyToManyBSideEntity.class));

                        l.add(new MDDMenu("Map", "Mapper", MapMapperEntity.class, "Key", MapKeyEntity.class, "Value", MapValueEntity.class));

                        return l;
                    }
                });

                l.add(new AbstractMenu("More relations") {
                    @Override
                    public List<MenuEntry> buildEntries() {
                        List<MenuEntry> l = new ArrayList<>();

                        l.add(new MDDOpenCRUDAction("Element collection", WithElementCollectionEntity.class));

                        l.add(new MDDOpenCRUDAction("Embedded", WithEmbeddedEntity.class));

                        l.add(new MDDOpenCRUDAction("Primitive collections", PrimitiveCollectionsFieldDemoEntity.class));

                        l.add(new MDDOpenCRUDAction("Primitive arrays", PrimitiveArraysFieldDemoEntity.class));

                        l.add(new MDDOpenCRUDAction("Data providers", DataProviderFieldDemoEntity.class));

                        return l;
                    }
                });


                return l;
            }
        });


        m.add(new AbstractMenu("JPA") {
            @Override
            public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();

                l.add(new AbstractMenu("CRUDs") {
                    @Override
                    public List<MenuEntry> buildEntries() {
                        List<MenuEntry> l = new ArrayList<>();

                        l.add(new MDDOpenCRUDAction("Subclasses", Superclass.class));

                        l.add(new MDDOpenCRUDAction("Users CRUD", User.class));

                        return l;
                    }
                });

                l.add(new AbstractMenu("JPQL") {
                    @Override
                    public List<MenuEntry> buildEntries() {
                        List<MenuEntry> l = new ArrayList<>();

                        l.add(new MDDOpenListViewAction("Sample JPQL list view", SampleJPQLLIstView.class));

                        l.add(new MDDOpenListViewAction("Sample JPQL crud view", SampleJPQLCrudView.class));

                        l.add(new MDDOpenListViewAction("Sample JPQL to POJO crud view", SampleJPQLToPPOJOCrudView.class));

                        l.add(new MDDOpenCRUDAction("With groups", Person.class));

                        return l;
                    }
                });

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


}
