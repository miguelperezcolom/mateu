using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>A street map with markers in a component-tree view — mirrors the Java MapSyncTest
/// fixture.</summary>
[UI("hotels-map")]
[Title("Hotels")]
public class HotelsMapView : IComponentTreeSupplier
{
    public IComponent Component() => new Mateu.Uidl.Map
    {
        Id = "hotels",
        Zoom = "12",
        MarkerActionId = "openHotel",
        Markers =
        [
            new MapMarker
            {
                Id = "palma", Latitude = 39.5696, Longitude = 2.6502,
                Label = "Hotel Palma", Description = "120 rooms", Color = "#c74634",
            },
            new MapMarker { Id = "port", Latitude = 39.5546, Longitude = 2.6236, Label = "Hotel Port" },
        ],
    };

    [Action]
    public Message OpenHotel(RunActionRqDto rq)
    {
        var id = rq.Parameters.TryGetValue("_markerId", out var v)
            ? v is JsonElement e ? e.GetString() : v?.ToString()
            : null;
        return new Message($"Opened {id}");
    }
}

/// <summary>The map travels with its markers and marker action, the view advertises the marker
/// action it handles, and a marker click reaches the method with the marker id.</summary>
public class MapTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static SyncHandler Handler() => new(new MateuRegistry(typeof(HotelsMapView).Assembly));

    [Fact]
    public void The_map_travels_with_its_markers_and_marker_action()
    {
        var root = JsonSerializer.SerializeToElement(
            Handler().Handle(new RunActionRqDto { ServerSideType = typeof(HotelsMapView).FullName }), Json);

        var host = Assert.Single(Objects(root), o => o.TryGetProperty("children", out var c)
            && c.ValueKind == JsonValueKind.Array
            && c.EnumerateArray().Any(ch => ch.TryGetProperty("metadata", out var md)
                && md.ValueKind == JsonValueKind.Object
                && md.TryGetProperty("type", out var t) && t.GetString() == "Map"));
        var component = host.GetProperty("children").EnumerateArray()
            .Single(ch => ch.GetProperty("metadata").GetProperty("type").GetString() == "Map");
        Assert.Equal("hotels", component.GetProperty("id").GetString());

        var map = component.GetProperty("metadata");
        Assert.Equal("12", map.GetProperty("zoom").GetString());
        Assert.Equal(JsonValueKind.Null, map.GetProperty("position").ValueKind);
        Assert.Equal("openHotel", map.GetProperty("markerActionId").GetString());
        var markers = map.GetProperty("markers").EnumerateArray().ToList();
        Assert.Equal(2, markers.Count);
        var palma = markers[0];
        Assert.Equal("palma", palma.GetProperty("id").GetString());
        Assert.Equal(39.5696, palma.GetProperty("latitude").GetDouble());
        Assert.Equal(2.6502, palma.GetProperty("longitude").GetDouble());
        Assert.Equal("Hotel Palma", palma.GetProperty("label").GetString());
        Assert.Equal("120 rooms", palma.GetProperty("description").GetString());
        Assert.Equal("#c74634", palma.GetProperty("color").GetString());

        // the view handles the marker action, so it is advertised and the client sends it
        Assert.Contains(host.GetProperty("actions").EnumerateArray(),
            a => a.GetProperty("id").GetString() == "openHotel");
    }

    [Fact]
    public void A_map_without_id_answers_as_map()
    {
        var dto = ComponentMapper.Map(new Mateu.Uidl.Map { Position = "39.57, 2.65", Zoom = "10" });
        var cs = Assert.IsType<ClientSideComponentDto>(dto);
        Assert.Equal("map", cs.Id);
        var meta = Assert.IsType<MapMetadataDto>(cs.Metadata);
        Assert.Empty(meta.Markers);
        Assert.Null(meta.MarkerActionId);
        // no tile provider declared: the renderers fall back to OpenStreetMap
        Assert.Null(meta.TileUrl);
        Assert.Null(meta.Attribution);
    }

    [Fact]
    public void The_tile_provider_travels_when_declared()
    {
        var dto = ComponentMapper.Map(new Mateu.Uidl.Map
        {
            Zoom = "10",
            TileUrl = "https://tiles.example.com/{z}/{x}/{y}.png",
            Attribution = "© Example Tiles",
        });
        var meta = Assert.IsType<MapMetadataDto>(Assert.IsType<ClientSideComponentDto>(dto).Metadata);
        Assert.Equal("https://tiles.example.com/{z}/{x}/{y}.png", meta.TileUrl);
        Assert.Equal("© Example Tiles", meta.Attribution);
    }

    [Fact]
    public void A_marker_click_runs_the_action_with_the_marker_id()
    {
        var inc = Handler().Handle(new RunActionRqDto
        {
            Route = "hotels-map",
            ActionId = "openHotel",
            ServerSideType = typeof(HotelsMapView).FullName,
            InitiatorComponentId = "cmp-1",
            Parameters = new Dictionary<string, object?>
            {
                ["_markerId"] = JsonSerializer.SerializeToElement("port"),
            },
        });
        Assert.Equal("Opened port", Assert.Single(inc.Messages).Text);
    }

    private static IEnumerable<JsonElement> Objects(JsonElement el)
    {
        switch (el.ValueKind)
        {
            case JsonValueKind.Object:
                yield return el;
                foreach (var property in el.EnumerateObject())
                foreach (var nested in Objects(property.Value))
                    yield return nested;
                break;
            case JsonValueKind.Array:
                foreach (var item in el.EnumerateArray())
                foreach (var nested in Objects(item))
                    yield return nested;
                break;
        }
    }
}
