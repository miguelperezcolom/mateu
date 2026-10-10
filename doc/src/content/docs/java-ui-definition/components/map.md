---
title: "Map"
---

Embeds an interactive street map, centred on a position or fitted to a set of markers. A marker click can run an action.

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
| `id` | String | `"map"` | Component id |
| `position` | String | — | Geographic coordinates as `"latitude,longitude"`. Without it, the map fits its markers |
| `zoom` | String | — | Zoom level (typically `"1"` to `"20"`) |
| `markers` | `List<MapMarker>` | empty | The points to show |
| `markerActionId` | String | — | Action a marker click runs, with the marker id in `parameters._markerId` |
| `style` | String | — | Inline CSS — use to set height |
| `cssClasses` | String | — | CSS class names |

## Markers

```java
Map.builder()
    .id("properties")
    .markers(List.of(
        MapMarker.builder()
            .id("PMI01").latitude(39.5715).longitude(2.6490)
            .label("Palma Centre").description("22 of 180 rooms free")
            .color("#508223")
            .build(),
        MapMarker.builder()
            .id("PMI03").latitude(39.5580).longitude(2.6735)
            .label("Portixol").color("#c74634")
            .build()))
    .markerActionId("openProperty")
    .style("height: 34rem;")
    .build()

public Object openProperty(HttpRequest rq) {
  var id = rq.runActionRq().parameters().get("_markerId");
  // …return a Drawer, a Message, navigate…
}
```

A marker shows as a pin in its `color` (any CSS colour; a red pin when unset), with its `label` beside it and its `description` on hover.

What the map shows first:

| Given | The map shows |
|---|---|
| `position` | That point at `zoom` (the markers are drawn too) |
| no `position`, one marker | That marker, at `zoom` or close up (15) |
| no `position`, several markers | All of them, fitted |
| neither | The world |

The view needs a method named after `markerActionId` (public, or marked `@Action`), which is what advertises it to the client. See [actions referenced by components](/java-ui-definition/annotations/actions/#actions-referenced-by-components).

## Renderers

| Renderer | How it draws the map |
|---|---|
| Vaadin | OpenLayers with OpenStreetMap tiles |
| Redwood | Leaflet, loaded from cdnjs, with OpenStreetMap tiles. JET has no street map component (`oj-thematic-map` draws GeoJSON geography, not tiles) |
| React Native, IntelliJ | A list of the markers, each opening the point on openstreetmap.org. Neither renderer ships a native map SDK |

The OpenStreetMap tile servers are not meant for heavy production traffic. A deployment with real load should use its own or a contracted tile provider.

The .NET (`Map`, `MapMarker`) and Python (`fluent.Map`, `MapMarker`) backends emit the same wire.

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
