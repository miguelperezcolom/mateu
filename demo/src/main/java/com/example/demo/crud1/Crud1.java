package com.example.demo.crud1;

import com.vaadin.data.provider.QuerySortOrder;
import io.mateu.mdd.core.interfaces.RpcCrudView;
import lombok.Getter;
import lombok.Setter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
@Getter@Setter
public class Crud1 implements RpcCrudView<Formulario, Fila, Editor> {

    @Override
    public String toString() {
        return "Hola xxx";
    }

    @Override
    public Object deserializeId(String sid) {
        return null;
    }

    @Override
    public void delete(Set<Fila> selection) {

    }

    @Override
    public List<Fila> rpc(Formulario filters, List<QuerySortOrder> sortOrders, int offset, int limit) throws Throwable {
        System.out.println("nombre = " + filters.getNombre());
        Thread.sleep(5000);
        return new ArrayList<>();
    }

    @Override
    public int gatherCount(Formulario filters) throws Throwable {
        return 0;
    }


}
