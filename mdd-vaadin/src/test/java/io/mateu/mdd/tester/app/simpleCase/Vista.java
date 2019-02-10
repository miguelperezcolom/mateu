package io.mateu.mdd.tester.app.simpleCase;

import com.google.common.collect.Lists;
import io.mateu.mdd.core.annotations.DependsOn;
import io.mateu.mdd.core.annotations.SameLine;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import java.time.LocalDate;
import java.util.List;

@Getter
public class Vista {

    @Min(0)@Max(100)@Setter
    private int valor;

    @Setter@SameLine
    private boolean check;

    private List<Linea> lineas = Lists.newArrayList(new Linea("Mateu", 10), new Linea("Antonia", 41));

    private LocalDate fecha;

    @DependsOn("check")
    public boolean isLineasVisible() {
        return check;
    }

    @DependsOn("check")
    public boolean isFechaVisible() {
        return check;
    }


    @Getter@Setter@AllArgsConstructor
    public class Linea {

        private String nombre;

        private int edad;

    }
}
