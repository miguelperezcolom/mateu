---
title: "App"
weight: 100
---

## Introduction

An `App` is a high level convenience component which allows the user to navigate among other components by using a navigation menuBar.

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

@Route("/fluent-app")
@Serdeable
public class FluentApp implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
                .pageTitle("Fluent app")
                .title("Antonia")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.MENU_ON_LEFT)
                .menuBar(List.of(
                        new Menu("Home", new RouteLink("/fluent-app/home"), true),
                        new Menu("Page 1", new RouteLink("/fluent-app/page1")),
                        new Menu("Page 2", new RouteLink("/fluent-app/page2"))
                ))
                .build();
    }
}

```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}


Please notice that in the example above we need to have some java classes related to the mentioned routes, like in the example below:

```java
@Route("/fluent-app/home")
public class Home {

}
```


## Where to place the menuBar

When you declare an `App` you have four options for positioning the menuBar: with a hamburger menuBar, in a menuBar bar in the top, in a menuBar bar on the left or as tabs.

By default, tabs will be created if there is no submenu. If there is a submenu then a menuBar on the top will be created.

## Nesting Apps

You can nest as many Apps as you want, for creating your UI.

## Better one app only per page

Even though it is technically possible to include more than one app component per page, you will usually include only one. 

If you include more than one app component per page please notice that, as per today, you can have conflicts as there is 
only one url for the browser. If you put more than one app component in the same page you will be unintendedly overwriting
the browser url which comes from the user having selected an option in one app, when the user selects a menu option 
in the other app.

