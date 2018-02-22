package io.mateu.mdd.model.tests.usaridparaseleccionar;


import io.mateu.ui.mdd.server.annotations.UseIdToSelect;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
@Getter
@Setter
@UseIdToSelect(ql = "select x.id, x.name as text from Referenciado x where x.id = xxxx")
public class Referenciado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    @Override
    public String toString() {
        return "" + getId() + " / " + getName();
    }
}
