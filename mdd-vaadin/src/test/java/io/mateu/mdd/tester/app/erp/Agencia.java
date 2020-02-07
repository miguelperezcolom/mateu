package io.mateu.mdd.tester.app.erp;

import io.mateu.mdd.core.annotations.DependsOn;
import io.mateu.mdd.core.annotations.Password;
import io.mateu.mdd.core.interfaces.HasHeader;
import io.mateu.mdd.core.interfaces.Header;
import io.mateu.mdd.core.interfaces.HeaderType;
import lombok.MateuMDDEntity;

import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class Agencia implements HasHeader {

    private String nombre;

    @Password
    private String pwd;

    @ManyToOne@NotNull
    private Localidad localidad;

    @ManyToOne
    private Agencia central;

    @Override
    public Header getHeader() {
        if ("success".equals(nombre)) return new Header(HeaderType.Success, "Confirmada");
        if ("warning".equals(nombre)) return new Header(HeaderType.Warning, "Aviso");
        if ("info".equals(nombre)) return new Header(HeaderType.Info, "Información");
        if ("error".equals(nombre)) return new Header(HeaderType.Error, "Cancelada");
        return null;
    }
}
