---
title: "Context Menu"
weight: 100
---

A menu which shows up when the user clicks, right-clicks or long-presses a wrapped component.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
                        "type": "ClientSide",
                        "metadata": {
                            "type": "ContextMenu",
                            "menu": [
                                {
                                    "label": "Page 1",
                                    "destination": {
                                        "route": "page1"
                                    },
                                    "visible": true,
                                    "selected": false,
                                    "separator": false
                                },
                                {
                                    "label": "Page 2",
                                    "destination": {
                                        "route": "page2"
                                    },
                                    "visible": true,
                                    "selected": false,
                                    "separator": false
                                }
                            ],
                            "wrapped": {
                                "type": "ClientSide",
                                "metadata": {
                                    "type": "Text",
                                    "container": "div",
                                    "text": "I am a wrapped element. Just right click me :)"
                                },
                                "id": "fieldId"
                            }
                        },
                        "id": "fieldId"
                    };

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

     ContextMenu.builder()
            .menu(List.of(
                    RouteLink.builder()
                            .label("Page 1")
                            .build(),
                    RouteLink.builder()
                            .label("Page 2")
                            .build()
            ))
            .wrapped(new Text("I am a wrapped element. Just right click me :)"))
            .build(),

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
| **menu**                | list of menu options, as Actionables      |                                |
| **wrapped**             | the wrapped component                     | any component                  |
| **activateOnLeftClick** | to show up the context menu on left click | true/false                     |


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


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/context-menu


