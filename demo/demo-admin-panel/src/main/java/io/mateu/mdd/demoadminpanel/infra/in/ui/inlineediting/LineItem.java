package io.mateu.mdd.demoadminpanel.infra.in.ui.inlineediting;

import io.mateu.uidl.annotations.Label;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class LineItem {
    @Label("Producto") String product;
    @Label("Cantidad") int qty;
    @Label("Precio")   double price;
    @Label("Activo")   boolean active;
}
