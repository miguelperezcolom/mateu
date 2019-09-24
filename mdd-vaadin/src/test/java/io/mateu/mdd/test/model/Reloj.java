package io.mateu.mdd.test.model;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.DependsOn;
import io.mateu.mdd.core.annotations.Ignored;
import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.core.util.Helper;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.Pattern;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter@Setter
public class Reloj {

    @Pattern(regexp = "z")
    private String test;

    public void setTest(String test) throws Error {
        if (test != null && !"a".equalsIgnoreCase(test)) throw new Error("test debe ser igual a a");
        this.test = test;
    }

    @NotEmpty
    private String test2;

    public void setTest2(String test2) throws Error {
        if (test2 != null && !"a".equalsIgnoreCase(test2)) throw new Error("test2 debe ser igual a a");
        this.test2 = test2;
    }

    @Output
    private String proyecto;

    @Output
    private String activoDesde;

    @Output
    private String horasAcumuladasEnEsteTramo;

    @Output
    private String horasAcumuladasHoy;

    @Ignored
    private boolean contando;

    @Ignored
    private boolean hay;

    @Output
    private String calculado;

    public Reloj() throws Throwable {
        refrescar();
    }


    @Action(order = 10, icon = VaadinIcons.REFRESH)
    public void refrescar() throws Throwable {
        double acum = 0;
        setProyecto("xxxxxxxxxx");
        setActivoDesde("yyyyyyy");
        acum = 15.3;
        setHorasAcumuladasEnEsteTramo("" + acum);
        LocalDateTime h = LocalDate.now().atStartOfDay();
        setHorasAcumuladasHoy("qqqqqqq");
        calculado = "" + LocalDateTime.now();
    }

    @Action(order = 20, icon = VaadinIcons.START_COG)
    public void iniciar() throws Throwable {
        contando = true;
        refrescar();
    }

    @DependsOn("contando")
    public boolean isIniciarVisible() {
        return !contando;
    }

    @Action(order = 30, icon = VaadinIcons.ARROWS_CROSS)
    public void cambiar() throws Throwable {
        contando = true;
        iniciar();
    }

    @DependsOn("contando")
    public boolean isCambiarVisible() {
        return contando;
    }

    @Action(order = 40, icon = VaadinIcons.PAUSE)
    public void pausar() throws Throwable {
        contando = false;
        refrescar();
    }

    @DependsOn("contando")
    public boolean isPausarVisible() {
        return contando;
    }


    @Action(order = 50, icon = VaadinIcons.PLAY)
    public void reanudar() throws Throwable {
        contando = true;
        refrescar();
    }

    @DependsOn("contando")
    public boolean isReanudarVisible() {
        return !contando && hay;
    }

}
