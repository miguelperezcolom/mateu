package test;

import com.vaadin.navigator.View;
import io.mateu.fake.FakeMDDUIInjector;
import io.mateu.fake.FakeUI;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.MateuApp;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.vaadin.controllers.MateuViewProvider;
import io.mateu.mdd.vaadin.navigation.ViewStack;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import io.mateu.util.persistence.JPAHelper;
import javassist.ClassPool;
import org.example.application.population.Populator;
import org.example.application.ui.ComplexUI;
import org.example.domain.boundaries.common.entities.Person;
import org.junit.BeforeClass;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class MateuViewProviderTest {

    @BeforeClass
    public static void init() throws Throwable {
        MDDUIAccessor.injector = new FakeMDDUIInjector();
        ReflectionHelper.injector = new FakeMDDUIInjector();
        FakeUI.app = new MateuApp(ComplexUI.class);
        FakeUI.app.updateSession();
        MDD.setClassPool(ClassPool.getDefault());
        Populator.populateAll();
    }


    @Test
    public void testHome() {

        View v = new MateuViewProvider(new ViewStack()).getView("");

        assertEquals("Academics", v.toString());

    }

    @Test
    public void testPublic() {

        View v = new MateuViewProvider(new ViewStack()).getView("/public");

        assertEquals("Academics", v.toString());

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
    public void testAcademicsPersons_() {

        View v = new MateuViewProvider(new ViewStack()).getView("/public/academics/menu/persons&name_");

        assertEquals("Persons", v.toString());

    }

    @Test
    public void testAcademicsPerson1() throws Throwable {

        Person p = JPAHelper.find(Person.class, 1l);

        View v = new MateuViewProvider(new ViewStack()).getView("/public/academics/menu/persons/1");

        assertEquals(Helper.capitalize(p.getClass().getSimpleName()) + " " + p.toString(), v.toString());

    }

    @Test
    public void testAcademicsPerson1_() throws Throwable {

        Person p = JPAHelper.find(Person.class, 1l);

        View v = new MateuViewProvider(new ViewStack()).getView("/public/academics/menu/persons&name_/1");

        assertEquals(Helper.capitalize(p.getClass().getSimpleName()) + " " + p.toString(), v.toString());

    }

    @Test
    public void testAcademicsPerson1_AndBack() throws Throwable {

        Person p = JPAHelper.find(Person.class, 1l);

        View v = new MateuViewProvider(new ViewStack()).getView("/public/academics/menu/persons&name_/1");

        assertEquals(Helper.capitalize(p.getClass().getSimpleName()) + " " + p.toString(), v.toString());

        v = new MateuViewProvider(new ViewStack()).getView("/public/academics/menu/persons");

        assertEquals("Persons", v.toString());

    }

}
