package io.mateu.mdd.tester.app.simpleCase;

import com.google.common.collect.Lists;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.DependsOn;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.annotations.SameLine;
import io.mateu.mdd.tester.model.useCases.hotel.Booking;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Getter@Setter
public class Vista2 {

    @Getter@Setter
    public class Linea {

        @ManyToOne
        private Booking booking;

        private String nombre;

        public void setNombre(String nombre) {
            this.nombre = nombre;
            salida = "" + nombre + "xx";
            edad = 20;
        }

        @Output
        private String salida;

        private Integer edad;

    }

    private List<Linea> lineas = Lists.newArrayList();

    public Linea createLineasInstance() {
        return new Linea();
    }


    @Action
    public void add20() {
        List<Linea> l = new ArrayList<>(lineas);
        for (int i = 0; i < 20; i++) {
            l.add(new Linea());
        }
        setLineas(l);
    }

}
