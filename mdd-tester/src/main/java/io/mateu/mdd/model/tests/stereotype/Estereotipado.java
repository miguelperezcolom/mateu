package io.mateu.mdd.model.tests.stereotype;

import io.mateu.ui.mdd.server.annotations.Stereotype;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.util.List;

@Entity
@Getter
@Setter
public class Estereotipado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @Stereotype(Converter1.class)
    private String a;


    private String b;
}
