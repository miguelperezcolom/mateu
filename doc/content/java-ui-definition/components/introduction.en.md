---
title: "Introduction *"
weight: 2
---

You create the UIs by composing different components together. With `Mateu`, you use plain java classes for declaring those components and how they are combined to create your UIs.

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


Usually **Mateu** allows you to define your UIs in both a declarative and imperative way. That mean, using annotations or implementing interfaces.

You can find below the same UI defined using a fluent style imperative way:

```java

public class MyUi implements DynamicUI {

  public UIIncrement getUIIncrement() {
    return UIIncrement.builder()
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
      .build();
  }
}

```
