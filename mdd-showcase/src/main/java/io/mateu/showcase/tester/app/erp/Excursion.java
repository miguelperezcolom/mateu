package io.mateu.showcase.tester.app.erp;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.KPI;
import io.mateu.mdd.core.annotations.Money;
import io.mateu.mdd.util.Helper;
import io.mateu.mdd.util.workflow.WorkflowEngine;
import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;
import javax.persistence.PostPersist;
import javax.persistence.PostUpdate;
import javax.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

@MateuMDDEntity
public class Excursion {

    @KPI@Money
    private double total;

    @NotBlank
    private String name;

    private boolean updateTotal;

    @OneToMany(cascade = CascadeType.ALL)
    private List<Grupo> grupos = new ArrayList<>();

    @OneToMany
    private List<Reserva> reservas = new ArrayList<>();

    @OneToMany(cascade = CascadeType.MERGE)
    private List<Coste> costes = new ArrayList<>();

    @Action(attachToField = "costes", order = 1)
    public void enviar(Set<Coste> costes) {
        costes.forEach(c -> c.setEstado(EstadoCoste.Enviado));
        setCostes(new ArrayList<>(getCostes()));
    }

    @Action(attachToField = "costes", order = 2)
    public void confirmar(Set<Coste> costes) {
        costes.forEach(c -> c.setEstado(EstadoCoste.Confirmado));
        setCostes(new ArrayList<>(getCostes()));
    }

    @Action(attachToField = "costes", order = 3)
    public void resetear(Set<Coste> costes) {
        costes.forEach(c -> c.setEstado(EstadoCoste.Inicial));
        setCostes(new ArrayList<>(getCostes()));
    }

    @PostPersist@PostUpdate
    public void post() {
        if (updateTotal) {
            WorkflowEngine.add(() -> {
                Helper.transact(em -> {
                    Thread.sleep(5000);
                    Excursion e = em.find(Excursion.class, id);
                    e.setUpdateTotal(false);
                    e.setTotal(new Random().nextDouble() * 100d);
                });
            });
        }
    }

}
