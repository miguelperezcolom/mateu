package reflection;

import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.SharedHelper;
import io.mateu.mdd.util.JPAHelper;
import io.mateu.mdd.vaadinport.vaadin.components.views.Transferrer;
import org.example.application.population.Populator;
import org.example.domain.boundaries.common.entities.Person;
import org.example.domain.boundaries.educational.entities.*;
import org.example.domain.boundaries.financial.entities.Invoice;
import org.example.domain.boundaries.financial.entities.Order;
import org.junit.BeforeClass;
import org.junit.Test;

import javax.persistence.EntityManager;

import static org.junit.Assert.assertEquals;

public class ReflectionTest {

    @BeforeClass
    public static void init() throws Throwable {
        SharedHelper.loadProperties();
        Populator.populateAll();
    }

    @Test
    public void oneToOne() throws Throwable {

        Classroom c1a0 = JPAHelper.find(Classroom.class, "name", "1A");
        Teacher rafel0 = JPAHelper.find(Teacher.class, "name", "Rafel");

        c1a0.setTutor(rafel0);

        JPAHelper.transact(em -> {

            new Transferrer().transfer(em, c1a0);

        });

        JPAHelper.transact(em -> {

            Classroom c1a = JPAHelper.find(em, Classroom.class, "name", "1A");
            Teacher rafel = JPAHelper.find(em, Teacher.class, "name", "Rafel");
            Classroom c1b = JPAHelper.find(em, Classroom.class, "name", "1B");
            Teacher flor = JPAHelper.find(em, Teacher.class, "name", "Flor");

            assertEquals(c1a.getTutor(), rafel);
            assertEquals(rafel.getTutorOf(), c1a);
            assertEquals(c1b.getTutor(), null);
            assertEquals(flor.getTutorOf(), null);

        });

    }


    @Test
    public void aggregation() throws Throwable {

        AcademicPlan p0 = JPAHelper.get(AcademicPlan.class, 1l);
        int numAsignaturasInicial = p0.getSubjects().size();
        p0.getSubjects().add(new Subject("Educación Física"));

        JPAHelper.transact(em -> {

            new Transferrer().transfer(em, p0);

        });

        JPAHelper.transact(em -> {

            AcademicPlan p = em.find(AcademicPlan.class, 1l);
            assertEquals(p.getSubjects().size(), numAsignaturasInicial + 1);
            assertEquals(JPAHelper.count(em, Subject.class), numAsignaturasInicial + 1);
            assertEquals(JPAHelper.count(em, Subject.class), numAsignaturasInicial + 1);

        });

    }

    @Test
    public void composition() throws Throwable {

        Course c0 = JPAHelper.get(Course.class, 1l);
        int numSemestersInicial = c0.getSemesters().size();
        c0.getSemesters().add(new Semester("Third semester"));

        JPAHelper.transact(em -> {

            new Transferrer().transfer(em, c0);

        });

        JPAHelper.transact(em -> {

            Course c = em.find(Course.class, 1l);
            assertEquals(c.getSemesters().size(), numSemestersInicial + 1);
            c.getSemesters().forEach(s -> {
                assertEquals(c, s.getCourse());
            });

        });

    }


    @Test
    public void addToCollection() throws Throwable {
        _addToCollection();
    }

    public Order _addToCollection() throws Throwable {

        Order o = new Order();
        o.setPerson(JPAHelper.get(Person.class, 1l));
        FieldInterfaced linesField = ReflectionHelper.getFieldByName(Order.class, "lines");

        ReflectionHelper.addToCollection(linesField, o);
        assertEquals(o.getLines().size(), 1);

        ReflectionHelper.addToCollection(linesField, o);
        assertEquals(o.getLines().size(), 2);

        o.getLines().forEach(l -> {
            assertEquals(o, l.getOrder());
        });

        return o;
    }


    @Test
    public void removeFromCollection() throws Throwable {

        Order o0 = _addToCollection();

        JPAHelper.transact(em -> {
            new Transferrer().transfer(em, o0);
        });

        JPAHelper.transact(em -> {

            Order o = em.find(Order.class, o0.getId());
            o.getLines().forEach(l -> {
                assertEquals(o, l.getOrder());
            });

        });
    }

}
