---
title: "Input fields"
weight: 100
---

Input fields you can use. Instead of creating different components for each field type, I have created one single 
**FormField** component and you manage how it is painted by using the **dataType** and **stereotype** fields. 

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "FormField",
    "fieldId": "name",
    "dataType": "date",
    "stereotype": "regular",
    "observed": false,
    "autofocus": false,
    "label": "Name",
    "colspan": 0,
    "rightAligned": false,
    "bold": false,
    "required": false
  },
  "id": "name"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

     FormField.builder()
              .id("name")
              .label("Name")
              .dataType(FieldDataType.date)
              .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

TBD.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for an input field:

| Property         | Description                                                                                             | Notes                          |
|------------------|---------------------------------------------------------------------------------------------------------|--------------------------------|
| **id**           | id for this component                                                                                   |                                |
| **cssClasses**   | list of css classes                                                                                     | content of the css attribute   |
| **style**        | inline style attributes                                                                                 | content of the style attribute |
| **label**        | label for this field                                                                                    | content of the style attribute |
| **dataType**     | one of integer, string, decimal, date, time, dateTime, bool, reference, array, file                     |                                |
| **stereotype**   | one of regular, radio, checkbox, textarea, toggle, combobox, select, email, password, richText, listBox |                                |
| **required**     | true/false                                                                                              |                                |
| **autofocus**    | true/false                                                                                              |                                |
| **description**  | help text                                                                                               |                                |
| **options**      | list of valid options                                                                                   |                                |
| **initialValue** | the initial value for this field. Will use the container component state if not provided                |                                |
| **validations**  | list of validations for this field                                                                      |                                |



