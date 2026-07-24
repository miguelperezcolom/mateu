package io.mateu.redwoodvb.ui;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import lombok.Getter;

/**
 * Fase 4 — a listing. A {@code List<Row>} field renders as a grid/table (rendered by the VB
 * dispatcher as an authentic oj-table fed by the Mateu rows). Loads directly via {@code __load__}
 * (unlike AutoCrud, whose 3-step mediator flow does not answer {@code __load__}).
 */
@UI("/products")
@Title("Productos")
@Getter
public class Products {

  List<Product> products =
      List.of(
          new Product("Laptop Pro 16", "Computers", 2499.0, 12),
          new Product("27\" Monitor", "Displays", 349.0, 40),
          new Product("Docking Station", "Accessories", 189.0, 25),
          new Product("Mechanical Keyboard", "Accessories", 129.0, 60),
          new Product("Wireless Mouse", "Accessories", 59.0, 120));

  public record Product(String name, String category, double price, int stock) {}
}
