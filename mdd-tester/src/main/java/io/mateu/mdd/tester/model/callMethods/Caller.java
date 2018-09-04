package io.mateu.mdd.tester.model.callMethods;

import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.IFrame;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.Pdf;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.core.interfaces.PushWriter;
import io.mateu.mdd.core.interfaces.RpcView;
import io.mateu.mdd.core.interfaces.WizardPage;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;
import io.mateu.mdd.tester.model.entities.basic.DateTimeFieldsDemoEntity;
import io.mateu.mdd.tester.model.entities.groups.Person;
import io.mateu.mdd.tester.model.rpc.SampleCustomizedRPCListView;
import io.mateu.mdd.tester.model.wizards.Wizard1Page1;

import javax.persistence.EntityManager;
import javax.persistence.Query;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.List;

public class Caller {

    public static void alert() {
        MDD.alert("Mensaje");
    }

    public static void doSomething() throws InterruptedException {
        Thread.sleep(3000);
    }

    public static int returnInt() {
        return 10;
    }

    public static String returnString(@NotEmpty String yourName) {
        return "Hello " + yourName;
    }

    public static String returnStringWithParameters(@NotNull BasicFieldsDemoEntity entity1, DateTimeFieldsDemoEntity entity2) {
        return "Hello " + entity1.getStringField();
    }


    public static Component returnsComponent(String yourName, int age) {
        return new Label("Hello " + yourName + "/" + age + ". This is a Vaadin Label!");
    }

    @Output
    public static POJO returnsReadOnlyPojo() {
        return new POJO("Mateu", 10);
    }

    public static POJO returnsDefaultEditablePojo() {
        return new POJO("Mateu", 10);
    }

    public static Person returnsEntity(EntityManager em) {
        return (Person) em.createQuery("select x from " + Person.class.getName() + " x").getResultList().get(0);
    }




    @IFrame
    public static URL returnURLInIframe() throws MalformedURLException {
        return new URL("http://elpais.es");
    }


    public static URL returnURL() throws MalformedURLException {
        return new URL("http://elpais.es");
    }




    public static List<Person> returnsList(EntityManager em) {
        return em.createQuery("select x from " + Person.class.getName() + " x").getResultList();
    }

    public static Query returnsQuery(EntityManager em) {
        return em.createQuery("select x from " + Person.class.getName() + " x");
    }

    public static AbstractAction returnsOpenListViewAction() {
        return new MDDOpenListViewAction("Open rpc view", SampleCustomizedRPCListView.class);
    }

    public static RpcView returnsListView() {
        return new SampleCustomizedRPCListView();
    }


    @Pdf
    public static List<Person> returnsListAsReport(EntityManager em) {
        return em.createQuery("select x from " + Person.class.getName() + " x").getResultList();
    }

    @Output
    public static Query returnsQueryAsReport(EntityManager em) {
        return em.createQuery("select x from " + Person.class.getName() + " x");
    }


    @Output
    public static RpcView returnsListViewAsReport() {
        return new SampleCustomizedRPCListView();
    }


    public static void throwsException() throws Exception {
        throw new Exception("Here comes the error message");
    }


    public static Person throwsException2(EntityManager em) {
        return (Person) em.createQuery("select x.iewhei from " + Person.class.getName() + " x").getResultList().get(0);
    }

    public static void longRunning(PushWriter pw) throws Exception {
        int maxSeconds = 20;
        for (int i = 0; i < maxSeconds; i++) {
            pw.push("Completed " + Math.round(100d * i / maxSeconds) + "%");
            Thread.sleep(1000);
        }
        pw.done("Finished");
    }



    public static WizardPage returnWizard() {
        return new Wizard1Page1();
    }

}
