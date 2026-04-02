---
title: "Markdown"
weight: 100
---

This is a component for displaying some markdown.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Markdown",
    "markdown": "## Rich Text Formatting\n\nYou can create **bold text**, *italicized text*, and \\`inline code\\` with simple Markdown syntax.\nYou can also ~~strike through~~ text when needed.\n\n## Lists\n\n### Ordered List:\n1. First item\n2. Second item\n3. Third item with **bold text**\n\n### Unordered List:\n- Fruits\n  - Apples 🍎\n  - Bananas 🍌\n  - Oranges 🍊\n- Vegetables\n  - Carrots\n  - Broccoli\n\n## Links & Quotes\n\n> Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.\n\n[Visit Mateu website](https://mateu.io) | [Learn more about Markdown](https://www.markdownguide.org/)\n\n"
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

  Markdown.builder()
          .markdown("""
                  ## Rich Text Formatting
                                                          
                  You can create **bold text**, *italicized text*, and \\`inline code\\` with simple Markdown syntax.
                  You can also ~~strike through~~ text when needed.
                                                          
                  ## Lists
                                                          
                  ### Ordered List:
                  1. First item
                  2. Second item
                  3. Third item with **bold text**
                                                          
                  ### Unordered List:
                  - Fruits
                    - Apples 🍎
                    - Bananas 🍌
                    - Oranges 🍊
                  - Vegetables
                    - Carrots
                    - Broccoli
                                                          
                  ## Links & Quotes
                                                          
                  > Markdown is a lightweight markup language that you can use to add formatting elements to plaintext text documents.
                                                          
                  [Visit Mateu website](https://mateu.io) | [Learn more about Markdown](https://www.markdownguide.org/)
                     
                  """)
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
| **markdown**     | the markdown                                                                                            | content of the style attribute |



