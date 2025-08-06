---
title: "Confirm Dialog"
weight: 100
---


A confirm dialog can be used to ask for user confirmation.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "children": [
    {
      "type": "ClientSide",
      "metadata": {
        "type": "Text",
        "container": "div",
        "text": "bla, bla, bla"
      },
      "id": "fieldId"
    }
  ],
  "metadata": {
    "type": "ConfirmDialog",
    "header": "Are you sure?",
    "canCancel": false,
    "canReject": false,
    "confirmText": "Yes, I want this to happen!",
    "openedCondition": "true",
    "confirmActionId": "confirm_action_id"
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

   ConfirmDialog.builder()
                .header("Are you sure?")
                .content(new Text("bla, bla, bla"))
                .confirmActionId("confirm_action_id")
                .confirmText("Yes, I want this to happen!")
                .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a accordion layout:

| Property             | Description                                             | Notes                          |
|----------------------|---------------------------------------------------------|--------------------------------|
| **id**               | id for this component                                   |                                |
| **cssClasses**       | list of css classes                                     | content of the css attribute   |
| **style**            | inline style attributes                                 | content of the style attribute |
| **header**           | dialog header                                           |                                |
| **content**          | dialog content                                          |                                |
| **canCancel**        | if true a cancel button is visible                      |                                |
| **canReject**        | if true a reject button is visible                      |                                |
| **rejectText**       | text for the reject button                              |                                |
| **confirmText**      | text for the confirm button                             |                                |
| **openedCondition**  | dialog is opened according to this condition evaluation |                                |
| **confirmActionId**  | id of action to run when user click the confirm button  |                                |
| **rejectActionId**   | id of action to run when user click the reject button   |                                |
| **cancelActionId**   | id of action to run when user click the cancel button   |                                |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/confirm-dialog


