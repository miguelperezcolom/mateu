package io.mateu.mdd.model.tests.tabs;

import io.mateu.mdd.model.tests.onetomany.Linea;
import io.mateu.ui.mdd.server.annotations.*;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.List;

@Entity
@Getter@Setter
public class Tabs {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Required
    @SearchFilter
    @ListColumn
    private String name;


    @Tab("a")
    @Required
    private String name1;

    private String name2;

    private String name3;

    private String name4;

    @Tab("b")
    private String name5;

    @Required
    private String name6;

    private String name7;

    private String name8;

    @Tab("c")
    private String name9;

    @Required
    private String name10;

    private String name11;

    private String name12;

    private String name13;


}
