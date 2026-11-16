using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

// PinnedLocale (MateuOptions.Locale / MATEU_LOCALE), mirrors Java's ConfiguredLocale: a BCP 47 tag,
// normalised like Locale.toLanguageTag(), anything else ignored with a warning.
[Collection(ProcessWideStateCollection.Name)]
public class PinnedLocaleTests
{
    [Theory]
    [InlineData("ES", "es")]
    [InlineData(" en_gb ", "en-GB")]
    [InlineData("zh-hant-tw", "zh-Hant-TW")]
    [InlineData("sr_LATN_rs", "sr-Latn-RS")]
    [InlineData("es-419", "es-419")]
    [InlineData("de-ch-1996", "de-CH-1996")]
    public void A_tag_is_normalised_like_javas_language_tag(string configured, string expected)
    {
        Assert.Equal(expected, PinnedLocale.Resolve(configured, out var rejected));
        Assert.Null(rejected);
    }

    [Theory]
    [InlineData("Latn")] // a script alone is not a language
    [InlineData("und")] // "undetermined" pins nothing
    [InlineData("UND-ES")]
    [InlineData("e")]
    [InlineData("es-")]
    [InlineData("es-ES; drop table")]
    public void What_is_not_a_language_tag_is_rejected_with_a_warning(string configured)
    {
        Assert.Null(PinnedLocale.Resolve(configured, out var rejected));
        Assert.NotNull(rejected);
        Assert.Contains(PinnedLocale.EnvVar, rejected);
    }

    [Fact]
    public void The_environment_variable_is_read_only_when_nothing_is_configured()
    {
        var before = Environment.GetEnvironmentVariable(PinnedLocale.EnvVar);
        try
        {
            Environment.SetEnvironmentVariable(PinnedLocale.EnvVar, "fr_ca");
            Assert.Equal("fr-CA", PinnedLocale.Resolve(null, out _));
            Assert.Equal("fr-CA", PinnedLocale.Resolve("  ", out _));
            Assert.Equal("it", PinnedLocale.Resolve("it", out _));

            Environment.SetEnvironmentVariable(PinnedLocale.EnvVar, null);
            Assert.Null(PinnedLocale.Resolve(null, out var rejected));
            Assert.Null(rejected);
        }
        finally
        {
            Environment.SetEnvironmentVariable(PinnedLocale.EnvVar, before);
        }
    }

    [Fact]
    public void A_request_gets_the_pinned_language_else_the_first_accept_language_tag()
    {
        Assert.Equal("es", PinnedLocale.Of("es", "de-DE,de;q=0.9"));
        Assert.Equal("de-DE", PinnedLocale.Of(null, "de-DE,de;q=0.9"));
        Assert.Null(PinnedLocale.Of(null, "*"));
        Assert.Null(PinnedLocale.Of(null, null));
    }
}
