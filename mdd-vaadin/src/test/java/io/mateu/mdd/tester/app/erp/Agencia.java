package io.mateu.mdd.tester.app.erp;

import com.google.common.base.Strings;
import com.vaadin.data.provider.DataProvider;
import com.vaadin.data.provider.ListDataProvider;
import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.annotations.DependsOn;
import io.mateu.mdd.core.annotations.KPI;
import io.mateu.mdd.core.annotations.Password;
import io.mateu.mdd.core.annotations.UseCheckboxes;
import io.mateu.mdd.core.interfaces.HasHeader;
import io.mateu.mdd.core.interfaces.Header;
import io.mateu.mdd.core.interfaces.HeaderType;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.core.workflow.WorkflowEngine;
import io.mateu.mdd.tester.model.useCases.bankAccount.BankAccount;
import lombok.MateuMDDEntity;

import javax.persistence.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@MateuMDDEntity
public class Agencia implements HasHeader {

    private String nombre;

    @OneToMany@UseCheckboxes
    private Set<BankAccount> accounts = new HashSet<>();

    public void setAccounts(Set<BankAccount> accounts) {
        this.accounts = accounts;
    }

    @DependsOn("nombre")
    public DataProvider getAccountsDataProvider() {
        try {
            return new ListDataProvider(Helper.findAll(BankAccount.class).stream().filter(a -> Strings.isNullOrEmpty(nombre) || a.getName().toLowerCase().contains(nombre.toLowerCase())).collect(Collectors.toList()));
        } catch (Throwable throwable) {
            MDD.alert(throwable);
            return new ListDataProvider(new ArrayList());
        }
    }

    @Min(1)
    private int del;

    @Min(1)
    private int al;

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


    @ManyToOne(cascade = CascadeType.ALL)
    private OfficeSerial serial;

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
