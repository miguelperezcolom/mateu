package test;

import com.vaadin.navigator.View;
import io.mateu.fake.FakeMDDUIInjector;
import io.mateu.fake.FakeUI;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.MateuApp;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.vaadin.controllers.MateuViewProvider;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import javassist.ClassPool;
import org.example.application.ui.ComplexUI;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class MateuViewProviderTest {

    @BeforeClass
    public static void init() throws Exception {
        MDDUIAccessor.injector = new FakeMDDUIInjector();
        FakeUI.app = new MateuApp(ComplexUI.class);
        FakeUI.app.updateSession();
        MDD.setClassPool(ClassPool.getDefault());
    }


    @Test
    public void testHome() {

        View v = new MateuViewProvider(new ViewStack()).getView("");

        assertEquals("Home", v.toString());

    }

    @Test
    public void testPublic() {

        View v = new MateuViewProvider(new ViewStack()).getView("/public");

        assertEquals("Home", v.toString());

    }

    @Test
    public void testAcademics() {

        View v = new MateuViewProvider(new ViewStack()).getView("/public/academics");

        assertEquals("Academics", v.toString());

    }

    @Test
    public void testAcademicsModule() {

        View v = new MateuViewProvider(new ViewStack()).getView("/public/academics/menu");

        assertEquals("Academics", v.toString());

    }

    @Test
    public void testAcademicsPersons() {

        View v = new MateuViewProvider(new ViewStack()).getView("/public/academics/menu/persons");

        assertEquals("Persons", v.toString());

    }

    @Test
    public void testAcademicsPerson1() {

        View v = new MateuViewProvider(new ViewStack()).getView("/public/academics/menu/persons/1");

        assertEquals("Mateu", v.toString());

    }}
