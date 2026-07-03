package io.mateu.mdd.demoadminpanel.infra.in.ui.inlineediting;

import io.mateu.mdd.demoadminpanel.infra.in.ui.proveedores.ProveedorId;
import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.Label;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LineItem {
    @Label("Producto")  String product;
    @Label("Cantidad")  int qty;
    @Label("Precio")    double price;
    @Label("Activo")    boolean active;
    @ColumnWidth("11rem") @Label("Categoría") LineCategory category;
    @ColumnWidth("11rem") @Label("Entrega")   LocalDate deliveryDate;
    @ColumnWidth("9rem")  @Label("Hora")      LocalTime deliveryTime;
    @ColumnWidth("15rem") @Label("Proveedor") @ProveedorId String supplierId;
}
