---
title: "Dialog"
weight: 100
---

You can put any content in a dialog. Just need to wrap it in a dialog component.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: 20rem;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Dialog",
    "headerTitle": "Title",
    "content": {
      "type": "ClientSide",
      "metadata": {
        "type": "Text",
        "container": "div",
        "text": "Hola!"
      },
      "id": "fieldId"
    },
    "noPadding": false,
    "modeless": false,
    "draggable": false,
    "resizable": false,
    "closeButtonOnHeader": true
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    Dialog.builder()
          .title("Title")
          .content(new Text("Hola!"))
          .closeButtonOnHeader(true)
          .build()
 
```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a details component:

| Property                | Description                                                                    | Notes                          |
|-------------------------|--------------------------------------------------------------------------------|--------------------------------|
| **id**                  | id for this component                                                          |                                |
| **cssClasses**          | list of css classes                                                            | content of the css attribute   |
| **style**               | inline style attributes                                                        | content of the style attribute |
| **headerTitle**         | the title in the header                                                        |                                |
| **header**              | content to be placed in the header                                             |                                |
| **footer**              | content to be placed in the footer                                             |                                |
| **content**             | the wrapped content                                                            |                                |
| **noPadding**           | if you want 0 padding for the content                                          |                                |
| **modeless**            | if you want to interact with what is behind the dialog                         |                                |
| **top**                 | position                                                                       |                                |
| **left**                | position                                                                       |                                |
| **draggable**           | if you want the dialog to be draggable                                         |                                |
| **width**               | size                                                                           |                                |
| **height**              | size                                                                           |                                |
| **resizable**           | if you want the user to be able to resize the dialog                           |                                |
| **closeButtonOnHeader** | adds a cross button on the header for closing the dialog, with no other effect |                                |

You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/dialog






