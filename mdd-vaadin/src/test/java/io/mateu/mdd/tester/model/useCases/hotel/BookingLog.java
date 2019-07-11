package io.mateu.mdd.tester.model.useCases.hotel;

import io.mateu.mdd.core.annotations.Action;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import java.util.Set;

@Entity@Getter@Setter
public class BookingLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String text;

    private int entero;

    @Action
    public static void accion(Set<BookingLog> seleccion) {

    }

}
