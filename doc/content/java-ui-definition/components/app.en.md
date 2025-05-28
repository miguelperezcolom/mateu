---
title: "App"
weight: 4
---

An `App` is a component which allows the user to navigate among other components by using a navigation menu.

The way for creating `App` components in **Mateu** is by providing a class which implements the `App` interface. Just like the example below:

```java
@Route("/app.*")
@Serdeable
public class MyApp implements HasMenu, HasHomeRoute, App {

    @Override
    public List<Menu> createMenu() {
        return List.of(
                new Menu("Home", new GoToRoute("/app/home")),
                new Menu("Page 1", new GoToRoute("/app/page1")),
                new Menu("Page 2", new GoToRoute("/app/page2"))
        );
    }

    @Override
    public String getHomeRoute() {
        return "/app/home";
    }
}
```

Please notice that in the example above we need to have some java classes related to the mentioned routes, like in the example below:

```java
@Route("/app/home")
public class Home implements Form {

}
```

## Declaratively define the menu

Instead of implementing the `HasMenu` interface, you can just use the `@Menu` annotation to define your menu options. So, for the example above, the same can be declared as below:

```java
@Route("/app.*")
public class MyApp implements App {

  @Menu@HomeRoute
  GoToRoute home = new GoToRoute("/app/home");
  @Menu
  GoToRoute page1 = new GoToRoute("/app/page1");
  @Menu
  GoToRoute page2 = new GoToRoute("/app/page2");

}
```
and you will have exactly the same result.

## Where to place the menu

When you declare an `App` you have 3 options for positioning the menu: in a menu bar in the top, in a menu bar on the left or as tabs.

By default tabs will be created if there is no submenu. If there is a submenu then a menu on the top will be created. You can override the defaults by implementing one of the following interfaces: `HasMenuOnTop`, `HasMenuOnLeft` or `HasMenuAsTabs`.

## Nesting Apps

you can nest as many Apps as you want, for creating your UI.

## Do it using a fluent style

You can do the same using fluent style code, as below:

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
