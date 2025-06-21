---
title: "Introduction"
weight: 1
---

You create the UIs by composing 47 different components together. With **Mateu**, you use plain java classes for declaring those components and how they are combined to create your UIs.

You can indeed do it using a declarative way using annotations, in a declarative though more dynamic way implementing some interfaces or in an imperative way using fluent code.  

Here you have an example:

```java

class Header implements VerticalLayout {
  @H2
  String title = "Hello, this is the title.";
  String subtitle = "This is the subtitle, bla, bla, bla.";
}

class Content implements List {
  String item1 = "Item 1 in a list";
  String item2 = "Item 2 in a list";
  String item3 = "Item 3 in a list";
  String item4 = "Item 4 in a list";
}

class Footer implements VerticalLayout {
  @H4
  String copyright = "Copyright Mateu 2025";
}

public class MyUi {

  Header header;
  
  Content content;
  
  Footer footer;
  
}


```

You can find below the same UI defined in an imperative way, using a fluent style code:

```java

public class MyUi implements FormSupplier {
  @Override
  public Form getForm(HttpRequest httpRequest) {
    return Form.builder()
      .fragment(VerticalLayout.builder()
        .add(VerticalLayout.builder()
          .add(new H2("Hello, this is the title."))
          .add("This is the subtitle, bla, bla, bla.")
          .build())
        .add(List.builder()
          .add("Item 1 in a list")
          .add("Item 2 in a list")
          .add("Item 3 in a list")
          .add("Item 4 in a list")
          .build())
        .add(VerticalLayout.builder()
          .add(new H4("Copyright Mateu 2025"))
          .build())
        .build())
      .build();
  }
}

```

You can obviously combine both ways as you want.

Please notice you can also leverage java inheritance and maven dependencies for building your UIs with Mateu.
