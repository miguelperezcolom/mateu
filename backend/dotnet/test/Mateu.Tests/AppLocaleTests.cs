using System.Text.Json;
using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
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

    // MateuOptions.Locale / MATEU_LOCALE (Java: mateu.locale) pins the UI language for every request,
    // whatever the browser's Accept-Language; the app's own ITranslator.Locale still wins.
    private static SyncHandler Hosted(string? locale, ITranslator? translator = null, string acceptLanguage = "de-DE,de;q=0.9")
    {
        var sc = new ServiceCollection();
        if (translator is not null) sc.AddSingleton(translator);
        sc.AddMateu(o => o.Locale = locale, typeof(LocaleApp).Assembly);
        var sp = sc.BuildServiceProvider();
        var ctx = new DefaultHttpContext();
        ctx.Request.Headers.AcceptLanguage = acceptLanguage;
        sp.GetRequiredService<IHttpContextAccessor>().HttpContext = ctx;
        return sp.GetRequiredService<SyncHandler>();
    }

    [Fact]
    public void A_pinned_locale_wins_over_the_browsers_language()
    {
        Assert.Equal("es", LocaleOf(Meta(Hosted("es"))));
        Assert.Equal("pt-BR", LocaleOf(Meta(Hosted("pt_br"))));
    }

    [Fact]
    public void Without_a_pinned_locale_the_browser_decides()
    {
        Assert.Equal("de-DE", LocaleOf(Meta(Hosted(null))));
    }

    [Fact]
    public void An_invalid_pinned_locale_is_ignored()
    {
        Assert.Null(PinnedLocale.Resolve("123!", out var rejected));
        Assert.NotNull(rejected);
        Assert.Equal("de-DE", LocaleOf(Meta(Hosted("123!"))));
    }

    [Fact]
    public void The_apps_translator_still_decides_over_the_pinned_locale()
    {
        Assert.Equal("ca", LocaleOf(Meta(Hosted("es", new CatalanTranslator()))));
        Assert.Equal("es", LocaleOf(Meta(Hosted("es", new PlainTranslator()))));
    }
}
