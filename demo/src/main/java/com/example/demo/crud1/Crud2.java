package com.example.demo.crud1;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.interfaces.HasSubtitle;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Subtitle;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.context.annotation.SessionScope;

import java.util.List;
import java.util.Set;

@Component
@SessionScope
@Getter@Setter
@Slf4j
public class Crud2 implements RpcCrudView<Crud2, Fila, ReadOnlyPersona>, HasTitle, HasSubtitle {

    private String nombre;

    private int edad;


    @Override
    public Object deserializeId(String sid) {
        return null;
    }

    @Override
    public void delete(Set<Fila> selection) {

    }

    @Override
    public List<Fila> rpc(Crud2 filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
        return List.of(
                new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
                , new Fila("Mateu", 14)
                , new Fila("Antonia", 46)
        );
    }

    @Override
    public int gatherCount(Crud2 filters) throws Throwable {
        return 36;
    }

    @Override
    public Object onEdit(Fila row) throws Throwable {
        return new ReadOnlyPersona(row);
    }

    @Override
    public Object onNew() throws Throwable {
        return new Formulario2();
    }

    @Action
    public void hacerAlgo() {
        log.info("seleccionado " + getSelectedRows().size());
    }

    @Action
    public void hacerAlgo2(String que) {
        log.info("seleccionado " + que + ": " + getSelectedRows().size());
    }

    @Action
    public void action() {
        log.info("nombre = " + nombre);
    }

    @Override
    public String getTitle() {
        return "This is the crud 2";
    }

    @Override
    public String getSubtitle() {
        return "This is a subtitle";
    }
}
