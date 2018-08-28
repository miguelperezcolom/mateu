package io.mateu.mdd.tester.model.entities.basic;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.annotations.Parameter;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.tester.model.useCases.bankAccount.Payment;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

@Entity
@Getter@Setter
public class ActionsDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "zzzz";

    private int intField;


    @Action(value = "Action on all", icon = VaadinIcons.AIRPLANE)
    public static void action1() {
        System.out.println("action 1");
    }

    @Action(value = "Action on all w/params")
    public static void action3(@Caption("Name from caption") String name, int age) {
        System.out.println("action 3 " + name + "/" + age);
    }

    @Action(value = "Action on all w/etity params")
    public static String action10(@Caption("Name from caption") String name, @NotNull Payment payment) {
        return "action 4 " + name + "/" + payment.getAmount();
    }

    @Action(value = "Action on all w/params+result")
    public static String action5(String name, int age) {
        String msg = "action 5 " + name + "/" + age;
        System.out.println(msg);
        return msg;
    }

    @Action(value = "Action on all w/injected params")
    public static void action4(EntityManager em, Set<ActionsDemoEntity> selection) {
        System.out.println("action 4. selected items count: " + selection.size());
        String text = UUID.randomUUID().toString().substring(0, 10);
        selection.forEach(o -> {
            o.setStringField(text);
            em.merge(o);
        });

    }

    @Action(value = "Action on item", icon = VaadinIcons.ALARM, confirmationMessage = "Are you sure you want to do it?")
    public void action2() {
        System.out.println("action 2");
        setStringField("" + getStringField() + " - " + new Date());
    }


    @Action(value = "Action on item w/params")
    public void action6(String name) {
        System.out.println("action 6 " + name);
        setStringField("" + getStringField() + "/6 - " + new Date());
    }


    @Action(value = "Action on item w/params + result")
    public String action7(String name) {
        String msg = "action 7 " + name;
        System.out.println(msg);
        return msg;
    }

    @Action(value = "Open custom component")
    public void action8() {

    }
}
