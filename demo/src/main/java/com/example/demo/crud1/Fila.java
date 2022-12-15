package com.example.demo.crud1;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.ColumnAction;
import io.mateu.mdd.core.app.ColumnActionGroup;
import io.mateu.mdd.shared.annotations.CellStyleGenerator;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.mdd.shared.data.Status;
import io.mateu.mdd.shared.data.StatusType;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Objects;
import java.util.UUID;

@Data@AllArgsConstructor
public class Fila {

    @Ignored
    private final String id = UUID.randomUUID().toString();

    private String nombre;

    private int edad;

    private final Status estado = new Status(StatusType.WARNING, "Hoola");

    private final ColumnAction boton = new ColumnAction(() -> {
        System.out.println("Hola desde " + this.getId());
        nombre = "xx";
    }, () -> this.getNombre(), () -> VaadinIcons.PLAY_CIRCLE_O);

    private final ColumnActionGroup menu = new ColumnActionGroup(new ColumnAction[]{
            new ColumnAction(() -> {
                System.out.println("Hola desde " + this.getId());
                nombre = "xx";
            }, () -> "Borrar", () -> VaadinIcons.TRASH),
            new ColumnAction(() -> {
                System.out.println("Hola desde " + this.getId());
                nombre = "xx";
            }, () -> "Refrescar", () -> VaadinIcons.REFRESH)
    });

    @Override
    public String toString() {
        return nombre;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Fila fila = (Fila) o;
        return Objects.equals(id, fila.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
