package io.mateu.showcase.test.model;

import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.OneToOne;
import java.time.LocalDateTime;

@MateuMDDEntity
@Slf4j
public class EntidadReferenciada {


    @Id
    @GeneratedValue
    private long id;

    private String nombre = "Entidad referenciada " + LocalDateTime.now();

    @OneToOne
    private Entidad unoAUnoInverso;


    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (id > 0 && obj != null && obj instanceof EntidadReferenciada && id == ((EntidadReferenciada) obj).getId());
    }

    @Override
    public String toString() {
        return nombre != null?nombre:"ER " + id;
    }
}
