---
title: "Carousel Layout"
weight: 100
---


A carousel layout layouts panels so only one of the panel contents is visible at a time, and you can navigate through them using keyboard button, swipe, ....

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
        "text": "Panel"
      },
      "id": "fieldId",
      "style": "background-color: #d7f0b2;color: darkgreen;border: 1px solid darkgreen;min-width: 7rem;max-width: 7rem;display: flex;align-items: center;justify-content: center;height: 3rem;margin-block-start: 0;margin-block-end: 0;"
    },
    {
      "type": "ClientSide",
      "metadata": {
        "type": "Text",
        "container": "div",
        "text": "Panel"
      },
      "id": "fieldId",
      "style": "background-color: #d7f0b2;color: darkgreen;border: 1px solid darkgreen;min-width: 7rem;max-width: 7rem;display: flex;align-items: center;justify-content: center;height: 3rem;margin-block-start: 0;margin-block-end: 0;"
    }
  ],
  "metadata": {
    "type": "CarouselLayout",
    "alt": false,
    "animating": false,
    "auto": false,
    "disabled": false,
    "disableSwipe": false,
    "disableKeys": false,
    "duration": 0,
    "dots": true,
    "end": false,
    "loop": true,
    "nav": true,
    "selected": 0,
    "total": 0
  },
  "style": "--skeleton-carousel-min-height: 9rem;"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

        CarouselLayout.builder()
                      .content(List.of(
                              buildPanel(),
                              buildPanel()
                      ))
                      .nav(true)
                      .dots(true)
                      .loop(true)
                      .style("--skeleton-carousel-min-height: 9rem;")
                      .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

```java

    @CarouselLayout
    List panels = List.of(
        new Text("Panel 1"),
        new Text("Panel 2"),
        new Text("Panel 3")
      );

```

or

```java

    @CarouselLayout
    class Container {
        
      Object panel1 = new Text("Panel 1");
      Object panel2 = new Text("Panel 2");
      Object panel3 = new Text("Panel 3");
      
    }

```

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for an accordion layout:

| Property          | Description                                                                                                                                             | Notes                          |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------|
| **id**            | id for this component                                                                                                                                   |                                |
| **cssClasses**    | list of css classes                                                                                                                                     | content of the css attribute   |
| **style**         | inline style attributes                                                                                                                                 | content of the style attribute |
| **fullWidth**     | shortcut to set width:100%                                                                                                                              | true/false                     |
| **alt**           | Flips the position of the navigation. Puts the navigation at the top of the carousel for the horizontal layout and to the left for the vertical layout. | true/false                     |
| **animating**     | Read-only value that indicates if the carousel is been animated (Transition).                                                                           | true/false                     |
| **auto**          | Change slides automatically.                                                                                                                            | true/false                     |
| **direction**     | Carousel direction (horizontal or vertical).                                                                                                            | horizontal/vertical            |
| **disabled**      | Disables component.                                                                                                                                     | true/false                     |
| **disable-swipe** | Disables swipe functionality.                                                                                                                           | true/false                     |
| **disable-keys**  | Disables keyboard navigation.                                                                                                                           | number                         |
| **duration**      | Autoplay interval time in milliseconds (Default: 4000)                                                                                                  | true/false                     |
| **dots**          | Show navigation dots.                                                                                                                                   | true/false                     |
| **end**           | Detail returns true when the carousel has reached the last slide.                                                                                       | true/false                     |
| **loop**          | Determines if the carousel should be looped. This affects the controls and the drag and drop functionality. Set to true if you need to loop the slides. | true/false                     |
| **nav**           | Show navigation next/prev buttons.                                                                                                                      | true/false                     |
| **selected**      | Selected slide (Starts at 0)                                                                                                                            | number                         |


You can see a full explanation of those properties at https://github.com/FabricElements/skeleton-carousel





