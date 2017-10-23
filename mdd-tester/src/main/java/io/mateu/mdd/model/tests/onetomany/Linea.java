package io.mateu.mdd.model.tests.onetomany;

import io.mateu.ui.mdd.server.annotations.ListColumn;
import io.mateu.ui.mdd.server.annotations.Required;
import io.mateu.ui.mdd.server.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class Linea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Required
    @SearchFilter
    @ListColumn
    private String name;

    private int age;

    private boolean active;

    private int[] ages;

}
