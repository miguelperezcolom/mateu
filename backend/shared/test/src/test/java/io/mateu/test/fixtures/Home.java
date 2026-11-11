package io.mateu.test.fixtures;

import io.mateu.core.infra.declarative.orchestrators.welcome.Welcome;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Panel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonStyle;
import io.mateu.uidl.data.Text;
import java.net.URI;

/** The starter's home page. */
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

  @Override
  protected String heroTitle() {
    return "My app";
  }

  @Action
  URI browseProducts() {
    return URI.create("/products");
  }
}
