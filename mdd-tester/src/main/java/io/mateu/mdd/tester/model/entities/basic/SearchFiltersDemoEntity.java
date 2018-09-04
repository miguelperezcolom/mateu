package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class SearchFiltersDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String a = "zzzz";

    @MainSearchFilter
    private String b;

    @SearchFilter
    private String c;

    @MainSearchFilter
    private String d;

    @SearchFilter
    private String e;

    @SearchFilter
    private String f;

    @SearchFilter
    private String g;

    @SearchFilter
    private String h;

    @SearchFilter
    private String i;

    private int intField;


}
