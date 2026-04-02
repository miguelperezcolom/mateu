---
title: "Notification"
weight: 100
---

A notification / toast.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Notification",
    "title": "Title",
    "text": "bla, bla, bla"
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

  Notification.builder()
              .title("Title")
              .text("bla, bla, bla")
              .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

There is no declarative thing for notifications. Just use a notification record as in imperative.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a micro frontend component:

| Property          | Description             | Notes                          |
|-------------------|-------------------------|--------------------------------|
| **id**            | id for this component   |                                |
| **cssClasses**    | list of css classes     | content of the css attribute   |
| **style**         | inline style attributes | content of the style attribute |
| **title**         | the notification title  |                      |
| **text**          | the notification text   |                                |

You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/notification


