using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// Translations for YAML apps (mirrors Java's YamlTranslationsSyncTest): <c>type: Translations</c>
/// files and the <c>translations/&lt;locale&gt;.yaml</c> convention, <c>${i18n.key}</c> resolved on the
/// server for the request's locale (exact → language → fallback → key), and an
/// ITranslationsSupplier merged UNDER the authored files.
/// </summary>
public class YamlTranslationsTests
{
    private static readonly string Dir = Specs();

    private static string Specs()
    {
        var dir = Directory.CreateTempSubdirectory("yaml-i18n-").FullName;
        Directory.CreateDirectory(Path.Combine(dir, "translations"));
        File.WriteAllText(Path.Combine(dir, "translations", "en.yaml"), """
            messages:
              orders:
                title: Orders
                onlyInEnglish: Only in English
            """);
        File.WriteAllText(Path.Combine(dir, "es-catalogue.yaml"), """
            type: Translations
            locale: es
            messages:
              orders:
                title: Pedidos
            """);
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), """
            routes:
              - route: i18n-page
                definition: page.yaml
            """);
        File.WriteAllText(Path.Combine(dir, "page.yaml"), """
            layout:
              type: VerticalLayout
              content:
                - type: Text
                  text: "${i18n.orders.title} — ${i18n.orders.onlyInEnglish} — ${i18n.orders.missing}"
                - type: FormField
                  id: name
                  label: ${i18n.orders.title}
            """);
        return dir;
    }

    private static string Render(string? locale) =>
        JsonSerializer.Serialize(
            new SyncHandler(new MateuRegistry(typeof(Access).Assembly), locale: () => locale, specsDir: Dir)
                .Handle(new RunActionRqDto { Route = "/i18n-page" }),
            new JsonSerializerOptions(JsonSerializerDefaults.Web)
            {
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
            });

    [Fact]
    public void Expressions_resolve_for_the_request_locale_with_the_fallback_chain()
    {
        var es = Render("es-ES"); // es-ES → es
        Assert.Contains("Pedidos — Only in English — orders.missing", es);
        Assert.DoesNotContain("${i18n", es);
        Assert.Contains("Orders — Only in English", Render("en"));
        // no locale → the fallback locale (en)
        Assert.Contains("Orders — Only in English", Render(null));
        // a locale with no catalogue → fallback too
        Assert.Contains("Orders —", Render("fr"));
    }

    private sealed class CodeCatalogue : ITranslationsSupplier
    {
        public IReadOnlyList<Translations> Translations() =>
        [
            new("es", new Dictionary<string, object?>
            {
                ["orders"] = new Dictionary<string, object?> { ["title"] = "Código", ["fromCode"] = "Desde código" },
            }),
        ];
    }

    [Fact]
    public void A_code_supplier_merges_under_the_authored_files()
    {
        var authored = TranslationRegistry.AuthoredFrom(Dir);
        var code = new CodeCatalogue().Translations();
        var registry = new TranslationRegistry(code.Concat(authored));
        Assert.Equal("Pedidos", registry.Message("orders.title", "es")); // authored wins
        Assert.Equal("Desde código", registry.Message("orders.fromCode", "es"));
        Assert.Equal("orders.nope", registry.Interpolate("${i18n.orders.nope}", "es"));
    }

    [Fact]
    public void The_catalogue_backs_the_mapper_translator_and_the_request_locale_names_the_ui_language()
    {
        var catalogue = new TranslationRegistry([new("es", new Dictionary<string, object?> { ["save"] = "Guardar" })]);
        var translator = new CatalogueTranslator(null, catalogue, () => "es");
        Assert.Equal("Guardar", translator.Translate("${i18n.save}"));
        Assert.Equal("Guardar", translator.Translate("save")); // the whole text as a key
        Assert.Equal("Keep me", translator.Translate("Keep me"));
        Assert.Equal("es", ((ITranslator)translator).Locale);
    }

    [Fact]
    public void A_file_that_is_not_a_translations_file_is_ignored()
    {
        Assert.Null(TranslationRegistry.Parse(YamlComponentBuilder.Deserialize("type: UI\nbasePath: /"), "app.yaml"));
        Assert.Equal("de", TranslationRegistry.Parse(
            YamlComponentBuilder.Deserialize("messages: {a: b}"), "translations/de.yaml")!.Locale);
    }
}
