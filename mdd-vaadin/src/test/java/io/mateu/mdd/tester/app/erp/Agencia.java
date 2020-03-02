package io.mateu.mdd.tester.app.erp;

import io.mateu.mdd.core.annotations.DependsOn;
import io.mateu.mdd.core.annotations.KPI;
import io.mateu.mdd.core.annotations.Password;
import io.mateu.mdd.core.interfaces.HasHeader;
import io.mateu.mdd.core.interfaces.Header;
import io.mateu.mdd.core.interfaces.HeaderType;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import lombok.MateuMDDEntity;

import javax.persistence.ManyToOne;
import javax.persistence.PostPersist;
import javax.persistence.PostUpdate;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@MateuMDDEntity
public class Agencia implements HasHeader {

    private String nombre;

    @Min(1)
    private final int del;

    @Min(1)
    private final int al;

    @Password
    private String pwd;

    @ManyToOne@NotNull
    private Localidad localidad;

    private LocalDate fecha;

    private LocalDateTime fechaYHora;

    @ManyToOne
    private Agencia central;

    @KPI
    private String kpi = "" + (System.currentTimeMillis() % 1000);


    @Override
    public Header getHeader() {
        if ("success".equals(nombre)) return new Header(HeaderType.Success, "Confirmada");
        if ("warning".equals(nombre)) return new Header(HeaderType.Warning, "Aviso");
        if ("info".equals(nombre)) return new Header(HeaderType.Info, "Información");
        if ("error".equals(nombre)) return new Header(HeaderType.Error, "Cancelada");
        return null;
    }

    @PostPersist@PostUpdate // solo se llama cuando realmente hemos modificado algo
    public void post() {
        System.out.println("agencia.post(), kpi = " + kpi + ", nombre = " + nombre);
        if (kpi == null || !kpi.equals(nombre)) // si no ponemos un control, entra en bucle
            System.out.println("agencia.post() --> añadimos tarea");
            WorkflowEngine.add(() -> {

                System.out.println("esperando 10 segundos...");
            Thread.sleep(10000);

                System.out.println("actualizando valor kpi");
            Helper.transact(em -> {
                Optional.of(em.find(Agencia.class, getId())).ifPresent(a -> a.setKpi(a.nombre));
            });
                System.out.println("fin transacción actualización kpi");
        });
    }

}
