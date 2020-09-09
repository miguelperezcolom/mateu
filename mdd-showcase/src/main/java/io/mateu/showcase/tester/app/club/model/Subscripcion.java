package io.mateu.showcase.tester.app.club.model;

import io.mateu.mdd.core.annotations.TextArea;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@MateuMDDEntity
public class Subscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(cascade = CascadeType.MERGE)
    @NotNull
    private Socio socio;

    @ManyToOne(cascade = CascadeType.MERGE)@NotNull
    private Servicio servicio;

    @ManyToOne(cascade = CascadeType.MERGE)@NotNull
    private OpcionServicio opcion;

    private boolean confirmada;

    private LocalDate alta;

    private LocalDate baja;

    //@KPI
    private double importe;


    @TextArea
    private String comentarios;


    public void setSocio(Socio socio) {
        retrocederSaldoSocio();
        this.socio = socio;
        actualizarSaldoSocio();
    }

    public void setOpcion(OpcionServicio opcion) {
        this.opcion = opcion;
        setImporte(opcion != null?opcion.getPrecio():0);
    }

    public void setConfirmada(boolean confirmada) {
        retrocederSaldoSocio();
        this.confirmada = confirmada;
        actualizarSaldoSocio();
    }

    public void setImporte(double importe) {
        if (this.socio != null) this.socio.setSaldo(this.socio.getSaldo() + this.importe);
        this.importe = importe;
        if (this.socio != null) this.socio.setSaldo(this.socio.getSaldo() - this.importe);
    }

    private void actualizarSaldoSocio() {
        if (this.socio != null && this.confirmada) {
            this.socio.setSaldo(this.socio.getSaldo() - this.importe);
        }
    }

    private void retrocederSaldoSocio() {
        if (this.socio != null && this.confirmada) {
            this.socio.setSaldo(this.socio.getSaldo() + this.importe);
        }
    }

}
