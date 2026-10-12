package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Text;
import java.net.URI;

/**
 * The home page, a {@link Welcome}: a hero with a title and an intro, {@link Button} fields as its
 * calls to action and {@code @Panel} fields as tiles below. A button runs the {@code @Action} method
 * named by its id; returning a {@link URI} navigates there. Reached through its menu entry in
 * {@link Shell}, which also makes it the page the app opens on.
 */
public class Home extends Welcome {

  Button browseProducts =
      Button.builder()
          .label("Browse products")
          .actionId("browseProducts")
          .buttonStyle(ButtonStyle.primary)
          .build();

  @Panel(title = "Products")
  Text products =
      new Text("Search, create, edit and delete products: a whole CRUD derived from one record.");

  @Panel(title = "Your next screen")
  Text next = new Text("Write a class for it and add a @Menu field of that class to Shell.");

  @Override
  protected String heroTitle() {
    return "My app";
  }

  @Override
  protected String heroSubtitle() {
    return "Every screen here is declared in Java; Mateu renders it.";
  }

  @Action
  URI browseProducts() {
    return URI.create("/products");
  }
}
