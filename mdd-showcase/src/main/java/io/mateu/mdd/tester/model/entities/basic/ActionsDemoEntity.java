package io.mateu.mdd.tester.model.entities.basic;

import com.vaadin.icons.VaadinIcons;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.tester.model.useCases.bankAccount.Payment;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.EntityManager;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

@MateuMDDEntity
@Slf4j
public class ActionsDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "zzzz";

    private int intField;


    @Action(value = "Open new tab", icon = VaadinIcons.AIRPLANE, order = 1)
    public static URL action0() throws MalformedURLException {
        return new URL("https://elpais.com");
    }

    @Action(value = "Action on all", icon = VaadinIcons.AIRPLANE, order = 2, style = ValoTheme.BUTTON_PRIMARY)
    public static void action1() {
        log.debug("action 1");
    }

    @Action(value = "Action on all w/params", order = 3, style = ValoTheme.BUTTON_DANGER)
    public static void action3(@Caption("Name from caption") String name, int age) {
        log.debug("action 3 " + name + "/" + age);
    }

    @Action(value = "Action on all w/etity params", order = 4, style = ValoTheme.BUTTON_FRIENDLY)
    public static String action10(@Caption("Name from caption") String name, @NotNull Payment payment) {
        return "action 4 " + name + "/" + payment.getAmount();
    }

    @Action(value = "Action on all w/params+result", order = 5)
    public static String action5(String name, int age) {
        String msg = "action 5 " + name + "/" + age;
        log.debug(msg);
        return msg;
    }

    @Action(value = "Action on all w/injected params", order = 6)
    public static void action4(EntityManager em, Set<ActionsDemoEntity> selection) {
        log.debug("action 4. selected items count: " + selection.size());
        String text = UUID.randomUUID().toString().substring(0, 10);
        selection.forEach(o -> {
            o.setStringField(text);
            em.merge(o);
        });

    }

    @Action(value = "Action on item", icon = VaadinIcons.ALARM, confirmationMessage = "Are you sure you want to do it?", order = 7)
    public void action2() {
        log.debug("action 2");
        setStringField("" + getStringField() + " - " + new Date());
    }


    @Action(value = "Action on item w/params", order = 8)
    public void action6(String name) {
        log.debug("action 6 " + name);
        setStringField("" + getStringField() + "/6 - " + new Date());
    }


    @Action(value = "Action on item w/params + result", order = 9)
    public String action7(String name) {
        String msg = "action 7 " + name;
        log.debug(msg);
        return msg;
    }

    @Action(value = "Open custom component", order = 10)
    public void action8() {

    }
}
