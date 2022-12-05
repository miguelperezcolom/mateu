package com.example.demo.crud1;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Caption;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.context.annotation.SessionScope;

import java.util.List;
import java.util.Set;

@Component
@SessionScope
@Getter@Setter
@Caption("UUUUUUUUUUUUU")
public class Crud2 implements RpcCrudView<Crud2, Fila, Editor> {

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
        System.out.println("nombre = " + filters.getNombre());
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
        return new Editor(row);
    }

    @Action
    public void hacerAlgo() {
        System.out.println("seleccionado " + getSelectedRows().size());
    }

    @Action
    public void hacerAlgo2(String que) {
        System.out.println("seleccionado " + que + ": " + getSelectedRows().size());
    }

    @Action
    public void action() {
        System.out.println("nombre = " + nombre);
    }
}
