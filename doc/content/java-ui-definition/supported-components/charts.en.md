---
title: "Charts"
weight: 100
---

A Chart.js wrapper.

<div style="display: flex; align-items: center; justify-content: center; width: 100%; margin-bottom: 30px;">
  <mateu-component id="componente" style="width: unset;"></mateu-component>
</div>

<script>

  const component = {
  "type": "ClientSide",
  "metadata": {
    "type": "Chart",
    "chartType": "line",
    "chartData": {
      "labels": [
        "uno",
        "dos",
        "tres",
        "cuatro"
      ],
      "datasets": [
        {
          "label": "label 1",
          "data": [
            1,
            2,
            3,
            4
          ]
        }
      ]
    },
    "chartOptions": {
      "maintainAspectRatio": false,
      "scales": {
        "y": {
          "beginAtZero": true
        }
      }
    }
  },
  "id": "fieldId"
};

    document.getElementById('componente').component = component;

</script>

{{< tabs "tab-group-name" >}}

{{< tab "Fluent" >}}

```java

     Chart.builder()
          .chartType(ChartType.line)
          .chartData(ChartData.builder()
                  .labels(List.of("uno", "dos", "tres", "cuatro"))
                  .datasets(List.of(ChartDataset.builder()
                                  .label("label 1")
                                  .data(List.of(1d, 2d, 3d, 4d))
                          .build()))
                  .build())
          .chartOptions(ChartOptions.builder()
                  .maintainAspectRatio(false)
                  .scales(ChartScales.builder()
                          .y(ChartAxisScale.builder()
                                  .beginAtZero(true)
                                  .build())
                          .build())
                  .build())
          .build()

```

{{< /tab >}}

{{< tab "Declarative" >}}

There is no declarative way of defining a chart. Just use the fluent version.

{{< /tab >}}

{{< /tabs >}}


## Available properties

This is the list of available properties for a chart:

| Property          | Description                                                                              | Notes                          |
|-------------------|------------------------------------------------------------------------------------------|--------------------------------|
| **id**            | id for this component                                                                    |                                |
| **cssClasses**    | list of css classes                                                                      | content of the css attribute   |
| **style**         | inline style attributes                                                                  | content of the style attribute |
| **fullWidth**     | shortcut to set width:100%                                                               | true/false                     |
| **chartType**     | One of bar, line, scatter, polarArea, bubble, pie, doughnut, radar                       |                      |
| **chartData**     | Chart data according to https://www.chartjs.org/docs/latest/general/data-structures.html |                      |
| **chartOptions**  | Chart options according to https://www.chartjs.org/docs/latest/general/options.html      |                      |


You can see a full explanation of those properties at https://github.com/FabricElements/skeleton-carousel




