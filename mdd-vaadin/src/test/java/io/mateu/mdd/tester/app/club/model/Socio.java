package io.mateu.mdd.tester.app.club.model;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.*;
import io.mateu.mdd.core.model.util.EmailHelper;
import io.mateu.mdd.core.util.Helper;
import lombok.MateuMDDEntity;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import javax.validation.constraints.NotEmpty;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@MateuMDDEntity
@Slf4j
public class Socio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Section("Datos")
    @NotEmpty
    private String nombre;

    private String apellidos;

    private String email;

    private LocalDate fechaNacimiento;

    private LocalDate alta;

    private LocalDate baja;

    private boolean activo;

    @KPI
    @Sum
    private double saldo;


    @Section("Actividad")
    @OneToMany(cascade = CascadeType.ALL, mappedBy = "socio")
    @UseLinkToListView(addEnabled = false, deleteEnabled = false)
    private List<Pago> pagos = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "socio")
    @UseLinkToListView(addEnabled = false, deleteEnabled = false)
    private List<Subscripcion> subscripciones = new ArrayList<>();

    @Override
    public String toString() {
        return "" + apellidos + ", " + nombre;
    }
    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
    @Override
    public boolean equals(Object obj) {
        return this == obj ||
                (obj != null && obj instanceof  Socio
                        && id == ((Socio)obj).id);
    }


    public void setSaldo(double saldo) {
        log.debug("***************");
        log.debug("saldo " + this + " de " + this.saldo);
        this.saldo = Helper.roundEuros(saldo);
        log.debug("saldo " + this + " a " + this.saldo);
        log.debug("***************");
    }


    @Action(icon = VaadinIcons.ENVELOPE)
    public static void mailing(@NotEmpty String asunto, @NotEmpty @TextArea String texto, Set<Socio> seleccion) {
        for (Socio s : seleccion) {
            try {
                s.enviarEmail(asunto, texto);
            } catch (Throwable throwable) {
                throwable.printStackTrace();
            }
        }
    }


    @Action(icon = VaadinIcons.ENVELOPE)
    public void enviarEmail(@NotEmpty String asunto, @NotEmpty @TextArea String texto) throws Throwable {
        EmailHelper.sendEmail(email, asunto, texto, false);
    }

}
