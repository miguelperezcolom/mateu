package io.mateu.mdd.tester.app.club.model;

import io.mateu.mdd.core.annotations.Sum;
import io.mateu.mdd.core.annotations.TextArea;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@MateuMDDEntity
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private LocalDateTime creado;

    @ManyToOne(cascade = CascadeType.MERGE)
    private Socio socio;

    private LocalDate vencimiento;

    @Sum
    private double importe;

    private LocalDateTime satisfecho;

    @TextArea
    private String comentarios;


    public void setSocio(Socio socio) {
        if (this.socio != null) this.socio.setSaldo(this.socio.getSaldo() - this.importe);
        this.socio = socio;
        if (this.socio != null) this.socio.setSaldo(this.socio.getSaldo() + this.importe);
    }

    public void setImporte(double importe) {
        if (this.socio != null) this.socio.setSaldo(this.socio.getSaldo() - this.importe);
        this.importe = importe;
        if (this.socio != null) this.socio.setSaldo(this.socio.getSaldo() + this.importe);
    }

    public void setSatisfecho(LocalDateTime satisfecho) {
        if (this.socio != null && this.satisfecho != null) this.socio.setSaldo(this.socio.getSaldo() - this.importe);
        this.satisfecho = satisfecho;
        if (this.socio != null && this.satisfecho != null) this.socio.setSaldo(this.socio.getSaldo() + this.importe);
    }
}
