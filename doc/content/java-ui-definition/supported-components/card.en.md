---
title: "Card"
weight: 100
---

## Introduction

A card is a component with several placeholders, which arranges them in order to build a card:

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  var component = {
                                        "type": "ClientSide",
                                        "metadata": {
                                            "type": "Card",
                                            "media": {
                                                "type": "ClientSide",
                                                "metadata": {
                                                    "type": "Image",
                                                    "src": "https://picsum.photos/seed/picsum/200/300"
                                                },
                                                "id": "fieldId"
                                            },
                                            "title": {
                                                "type": "ClientSide",
                                                "metadata": {
                                                    "type": "Text",
                                                    "container": "div",
                                                    "text": "Cover media"
                                                },
                                                "id": "fieldId"
                                            },
                                            "subtitle": {
                                                "type": "ClientSide",
                                                "metadata": {
                                                    "type": "Text",
                                                    "container": "div",
                                                    "text": "Subtitle"
                                                },
                                                "id": "fieldId"
                                            },
                                            "content": {
                                                "type": "ClientSide",
                                                "metadata": {
                                                    "type": "Text",
                                                    "container": "div",
                                                    "text": "Some content, bla, bla, bla"
                                                },
                                                "id": "fieldId"
                                            },
                                            "variants": [
                                                "coverMedia"
                                            ]
                                        },
                                        "id": "fieldId"
                                    };
  
  document.getElementById('componente').component = component;

</script>


The way to declare it is as follows:


{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

    Card.builder()
        .title(new Text("Cover media"))
        .subtitle(new Text("Subtitle"))
        .content(new Text("Some content, bla, bla, bla"))
        .media(new Image("https://picsum.photos/seed/picsum/200/300"))
        .variants(List.of(CardVariant.coverMedia))
        .build()


```

{{< /tab >}}

{{< tab "Declarative" >}}

```java

  @Title("Title")
  @Subtitle("Subtitle")
  @Media(image="https://picsum.photos/seed/picsum/200/300")
  @Variants({
    CardVariant.coverMedia
  })
  class MyCard implements Card {
  
    @RawContent
    String content = "Some content, bla, bla, bla";
  
  }

```

{{< /tab >}}

{{< /tabs >}}

## Available properties

This is the list of available properties for a card:

| Property         | Description                                    | Notes                          |
|------------------|------------------------------------------------|--------------------------------|
| **id**           | id for this component                          |                                |
| **cssClasses**   | list of css classes                            | content of the css attribute   |
| **style**        | inline style attributes                        | content of the style attribute |
| **title**        | content to be placed in the title slot         |                                |
| **subtitle**     | content to be placed in the subtitle slot      |                                |
| **media**        | content to be placed in the media slot         |                                |
| **header**       | content to be placed in the header slot        |                                |
| **headerPrefix** | content to be placed in the header prefix slot |                                |
| **headerSuffix** | content to be placed in the header suffix slot |                                |
| **content**      | content to be placed in the card               |                                |
| **footer**       | content to be placed in the footer slot        |                                |

This is the list of available variants for a card:

| Property         | Description                           | Notes |
|------------------|---------------------------------------|-------|
| **outlined**     | draws a border around the card        |       |
| **elevated**     | draws a shadow around the card        |       |
| **horizontal**   | puts the media on the left            |       |
| **stretchMedia** | adjusts the media size                |       |
| **coverMedia**   | the media fits the border of the card |       |


You can see a full explanation of those properties at https://vaadin.com/docs/latest/components/card
