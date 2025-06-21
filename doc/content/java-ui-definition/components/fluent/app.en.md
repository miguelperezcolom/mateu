---
title: "Apps"
weight: 4
---

## Introduction

An `App` is a component which allows the user to navigate among other components by using a navigation menu.

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
                .menu(List.of(
                        new Menu("Home", new RouteLink("/fluent-app/home"), true),
                        new Menu("Page 1", new RouteLink("/fluent-app/page1")),
                        new Menu("Page 2", new RouteLink("/fluent-app/page2"))
                ))
                .build();
    }
}

```

Please notice that in the example above we need to have some java classes related to the mentioned routes, like in the example below:

```java
@Route("/fluent-app/home")
public class Home {

}
```


## Where to place the menu

When you declare an `App` you have 4 options for positioning the menu: with a hamburger menu, in a menu bar in the top, in a menu bar on the left or as tabs.

By default, tabs will be created if there is no submenu. If there is a submenu then a menu on the top will be created.

## Nesting Apps

You can nest as many Apps as you want, for creating your UI.

