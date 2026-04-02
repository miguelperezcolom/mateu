---
title: "Menu Bar"
weight: 100
---


The typical menu bar.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "MenuBar",
    "options": [
      {
        "label": "Home",
        "destination": {
          "route": "/nested-apps/left/home"
        },
        "visible": true,
        "selected": false,
        "disabled": false,
        "disabledOnClick": false,
        "separator": false
      },
      {
        "label": "Page 1",
        "destination": {
          "route": "/nested-apps/left/page1"
        },
        "visible": true,
        "selected": false,
        "disabled": false,
        "disabledOnClick": false,
        "separator": false
      },
      {
        "submenus": [
          {
            "label": "Home",
            "destination": {
              "route": "/nested-apps/left/home"
            },
            "visible": true,
            "selected": false,
            "disabled": false,
            "disabledOnClick": false,
            "separator": false
          },
          {
            "label": "Page 1",
            "destination": {
              "route": "/nested-apps/left/page1"
            },
            "visible": true,
            "selected": false,
            "disabled": false,
            "disabledOnClick": false,
            "separator": false
          }
        ],
        "label": "Submenu",
        "visible": true,
        "selected": false,
        "disabled": false,
        "disabledOnClick": false,
        "separator": false
      }
    ]
  },
  "id": "component_id"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

   MenuBar.builder()
          .options(List.of(
                  new RouteLink("/nested-apps/left/home", "Home"),
                  new RouteLink("/nested-apps/left/page1", "Page 1"),
                  (Actionable) new Menu("Submenu", List.of(
                          new RouteLink("/nested-apps/left/home", "Home"),
                          new RouteLink("/nested-apps/left/page1", "Page 1")
                  ))
          ))
          .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a context menu:

| Property                | Description                               | Notes                          |
|-------------------------|-------------------------------------------|--------------------------------|
| **id**                  | id for this component                     |                                |
| **cssClasses**          | list of css classes                       | content of the css attribute   |
| **style**               | inline style attributes                   | content of the style attribute |
| **options**             | list of menu options, as Actionables      |                                |


And above is the list of classes implementing the Actionable interface, and their properties.

#### Common properties for all Actionables

These properties are common to all the menu options

| Property            | Description                                                                | Notes |
|---------------------|----------------------------------------------------------------------------|-------|
| **label**           | text to show. Only if no component is supplied                             |       |
| **selected**        | if this options must appear as checked                                     |       |
| **component**       | any component to be displayed instead of label                             |       |
| **className**       | any css class name                                                         |       |
| **disabled**        | if this option must appear as disabled                                     |       |
| **disabledOnClick** | if this option must be disabled on click                                   |       |
| **itemData**        | any object. It will travel back to the backend, if this option is selected |       |


#### RouteLink

Use it for taking the user to a concrete route

| Property   | Description          | Notes |
|------------|----------------------|-------|
| **route**  | route to navigate to |       |
| **target** | any of Top, Parent   |       |

#### MenuSeparator

The divider has no properties. Just draws an horizontal line.

#### Menu

| Property    | Description                              | Notes |
|-------------|------------------------------------------|-------|
| **submenu** | a list of Actionables (the menu options) |       |


#### ContentLink

| Property               | Description          | Notes |
|------------------------|----------------------|-------|
| **componentSupplier**  | a component supplier |       |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/menu-bar


