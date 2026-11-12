using System.IO.Compression;
using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// A renderer jar that is not a readable archive is no renderer: nothing is served from it, and a jar
// that goes bad while served answers no file rather than an error.
public class RendererArchiveTests
{
    [Fact]
    public void A_corrupt_jar_is_not_a_renderer()
    {
        var jar = Path.Combine(Path.GetTempPath(), $"mateu-corrupt-{Guid.NewGuid():N}.jar");
        File.WriteAllText(jar, "this is not a zip");
        try
        {
            Assert.Throws<FileNotFoundException>(() => RendererFiles.At(jar));
        }
        finally
        {
            File.Delete(jar);
        }
    }

    [Fact]
    public void A_jar_that_goes_bad_answers_no_file()
    {
        var jar = Path.Combine(Path.GetTempPath(), $"mateu-renderer-{Guid.NewGuid():N}.jar");
        using (var zip = ZipFile.Open(jar, ZipArchiveMode.Create))
        {
            using var writer = new StreamWriter(zip.CreateEntry(UiPage.JarPrefix + UiPage.Index).Open());
            writer.Write("<html><head></head><body></body></html>");
        }
        try
        {
            var renderer = RendererFiles.At(jar);
            Assert.NotNull(renderer.Stamp(UiPage.Index));
            File.WriteAllText(jar, "no longer a zip");
            Assert.Null(renderer.Stamp(UiPage.Index));
            Assert.Null(renderer.Read(UiPage.Index));
        }
        finally
        {
            File.Delete(jar);
        }
    }

    [Fact]
    public void Without_a_log_an_unusable_provider_is_kept_among_the_startup_warnings()
    {
        SignInProviders.AuthBlock(new SignInDeclared([new SignInProvider("warned-once") { Type = "oidc" }]), null);
        Assert.Contains(SignInProviders.Warnings, w => w.Contains("'warned-once'"));
    }
}
