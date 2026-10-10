using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// The UI language travels on the app shell (AppMetadataDto.Locale), mirrors Java's
// AppLocaleSyncTest: it is what the translator says; with no translator, nothing (the browser decides).
[App("Locale App")]
public class LocaleApp
{
    [MenuItem("Things")] public Things Home() => new();
}

public class AppLocaleTests
{
    private sealed class CatalanTranslator : ITranslator
    {
        public string Translate(string key) => key;
        public string? Locale => "ca";
    }

    private sealed class PlainTranslator : ITranslator
    {
        public string Translate(string key) => key;
    }

    private static JsonElement Meta(SyncHandler handler)
    {
        var inc = handler.Handle(new RunActionRqDto { ServerSideType = typeof(LocaleApp).FullName });
        var json = JsonSerializer.Serialize(inc, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        return JsonDocument.Parse(json).RootElement.GetProperty("fragments")[0]
            .GetProperty("component").GetProperty("metadata");
    }

    private static string? LocaleOf(JsonElement meta) =>
        meta.TryGetProperty("locale", out var l) && l.ValueKind == JsonValueKind.String ? l.GetString() : null;

    [Fact]
    public void The_translator_decides_the_ui_language()
    {
        var meta = Meta(new SyncHandler(new MateuRegistry(typeof(LocaleApp).Assembly), new CatalanTranslator()));
        Assert.Equal("ca", LocaleOf(meta));
    }

    [Fact]
    public void No_translator_or_a_silent_one_leaves_it_to_the_browser()
    {
        Assert.Null(LocaleOf(Meta(new SyncHandler(new MateuRegistry(typeof(LocaleApp).Assembly)))));
        Assert.Null(LocaleOf(Meta(new SyncHandler(new MateuRegistry(typeof(LocaleApp).Assembly), new PlainTranslator()))));
    }
}
