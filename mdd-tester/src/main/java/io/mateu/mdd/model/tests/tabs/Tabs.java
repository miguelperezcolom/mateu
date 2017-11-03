package io.mateu.mdd.model.tests.tabs;

import io.mateu.ui.mdd.server.annotations.ListColumn;
import io.mateu.ui.mdd.server.annotations.SearchFilter;
import io.mateu.ui.mdd.server.annotations.Tab;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class Tabs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull
    @SearchFilter
    @ListColumn
    private String name;


    @Tab("a")
    @NotNull
    private String name1;

    private String name2;

    private String name3;

    private String name4;

    @Tab("b")
    private String name5;

    @NotNull
    private String name6;

    private String name7;

    private String name8;

    @Tab("c")
    private String name9;

    @NotNull
    private String name10;

    private String name11;

    private String name12;

    private String name13;


}
