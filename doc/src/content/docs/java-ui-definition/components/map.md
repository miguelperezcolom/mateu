---
title: "Map"
---

Embeds an interactive map centred on a geographic position.

## Basic usage

```java
Map.builder()
    .position("39.5696005,2.6501603")  // latitude,longitude
    .zoom("14")
    .build()
```

## Properties

| Property | Type | Default | Description |
|---|---|---|---|
| `position` | String | — | Geographic coordinates as `"latitude,longitude"` |
| `zoom` | String | — | Zoom level (typically `"1"` to `"20"`) |
| `style` | String | — | Inline CSS — use to set height |
| `cssClasses` | String | — | CSS class names |

## Example with fixed height

```java
Map.builder()
    .position("51.5074,-0.1278")   // London
    .zoom("12")
    .style("height: 400px; width: 100%;")
    .build()
```

## Common zoom levels

| Zoom | Roughly shows |
|---|---|
| `3` | Continent |
| `8` | Region / county |
| `12` | City |
| `15` | Neighbourhood |
| `18` | Street level |
