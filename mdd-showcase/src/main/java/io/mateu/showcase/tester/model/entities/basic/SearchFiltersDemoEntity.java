package io.mateu.showcase.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.MainSearchFilter;
import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
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
