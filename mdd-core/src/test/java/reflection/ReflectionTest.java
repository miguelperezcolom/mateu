package reflection;

import io.mateu.mdd.core.reflection.FieldInterfaced;
import io.mateu.mdd.core.reflection.ReflectionHelper;
import io.mateu.mdd.core.util.SharedHelper;
import io.mateu.mdd.util.JPAHelper;
import io.mateu.mdd.vaadinport.vaadin.components.views.Transferrer;
import org.example.application.population.Populator;
import org.example.domain.boundaries.common.entities.Person;
import org.example.domain.boundaries.educational.entities.*;
import org.example.domain.boundaries.financial.entities.FinancialAgent;
import org.example.domain.boundaries.financial.entities.Invoice;
import org.example.domain.boundaries.financial.entities.InvoiceTag;
import org.example.domain.boundaries.financial.entities.Order;
import org.junit.BeforeClass;
import org.junit.Test;

import java.lang.reflect.InvocationTargetException;
import java.util.Date;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

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
        _createOrder();
    }

    public Order _createOrder() throws Throwable {

        Order o = new Order();
        o.setPerson(JPAHelper.get(Person.class, 1l));
        o.setRequestDateTime(new Date());
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

        Order o0 = _createOrder();

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


    @Test
    public void manyToMany() throws Throwable {

        Invoice i0 = _createInvoice();

        InvoiceTag p0 = JPAHelper.get(InvoiceTag.class, 1l);
        int invoicesAtTag0 = p0.getInvoices().size();
        InvoiceTag p1 = JPAHelper.get(InvoiceTag.class, 2l);
        int invoicesAtTag1 = p1.getInvoices().size();

        FieldInterfaced tagsField = ReflectionHelper.getFieldByName(Invoice.class, "tags");
        ReflectionHelper.addToCollection(tagsField, i0, p0);
        ReflectionHelper.addToCollection(tagsField, i0, p1);

        JPAHelper.transact(em -> new Transferrer().transfer(em, i0));

        JPAHelper.transact(em -> {

            Invoice i = em.find(Invoice.class, i0.getId());
            assertEquals(i.getTags().size(), 2);
            i.getTags().forEach(t -> assertTrue(t.getInvoices().contains(i)));
            JPAHelper.findAll(em, InvoiceTag.class).forEach(t -> t.getInvoices().forEach(x -> assertTrue(x.getTags().contains(t))));
            assertEquals(invoicesAtTag0 + 1, JPAHelper.get(InvoiceTag.class, 1l).getInvoices().size());
            assertEquals(invoicesAtTag1 + 1, JPAHelper.get(InvoiceTag.class, 2l).getInvoices().size());

        });

        Invoice i1 = JPAHelper.find(Invoice.class, i0.getId());
        i1.getTags().remove(p1);

        JPAHelper.transact(em -> new Transferrer().transfer(em, i1));

        JPAHelper.transact(em -> {

            Invoice i = em.find(Invoice.class, i0.getId());
            assertEquals(1, i.getTags().size());
            i.getTags().forEach(t -> assertTrue(t.getInvoices().contains(i)));
            JPAHelper.findAll(em, InvoiceTag.class).forEach(t -> t.getInvoices().forEach(x -> assertTrue(x.getTags().contains(t))));

        });

    }

    private Invoice _createInvoice() throws InvocationTargetException, NoSuchMethodException, InstantiationException, IllegalAccessException {
        Invoice o = new Invoice();
        o.setRecipient(JPAHelper.get(FinancialAgent.class, 1l));
        FieldInterfaced linesField = ReflectionHelper.getFieldByName(Invoice.class, "lines");

        ReflectionHelper.addToCollection(linesField, o);
        assertEquals(o.getLines().size(), 1);

        ReflectionHelper.addToCollection(linesField, o);
        assertEquals(o.getLines().size(), 2);

        return o;
    }


    @Test
    public void cascadeOneToMany() throws Throwable {
        AcademicPlan p0 = JPAHelper.get(AcademicPlan.class, 1l);
        assertTrue(p0.getSubjects().stream().filter(s -> "Inglés".equals(s.getName())).findFirst().isPresent());
        p0.getSubjects().stream().filter(s -> "Inglés".equals(s.getName())).forEach(s -> s.setName("Inglés X"));

        JPAHelper.transact(em -> new Transferrer().transfer(em, p0));

        JPAHelper.notransact(em -> {
            AcademicPlan p = em.find(AcademicPlan.class, 1l);
            assertEquals(p0.getSubjects().size(), p.getSubjects().size());
            assertTrue(p.getSubjects().stream().filter(s -> "Inglés X".equals(s.getName())).findFirst().isPresent());
        });
    }


    @Test
    public void addToCollectionNoPublicConstructor() throws Throwable {
        AcademicPlan p0 = JPAHelper.get(AcademicPlan.class, 1l);
        int numAsignaturasinicial = p0.getSubjects().size();
        FieldInterfaced subjectsField = ReflectionHelper.getFieldByName(AcademicPlan.class, "subjects");
        ReflectionHelper.addToCollection(subjectsField, p0);

        JPAHelper.transact(em -> new Transferrer().transfer(em, p0));

        JPAHelper.notransact(em -> {
            AcademicPlan p = em.find(AcademicPlan.class, 1l);
            assertEquals(numAsignaturasinicial + 1, p.getSubjects().size());
        });
    }


}
