package io.mateu.mdd.tester.model.basic;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class ActionsDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "zzzz";

    private int intField;


    @Action(name = "Action on all")
    public static void action1() {
        System.out.println("action 1");
    }

    @Action(name = "Action on item")
    public void action2() {
        System.out.println("action 2");
    }
}
