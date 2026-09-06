using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// Capability descriptor: an app advertises, on AppMetadataDto.RequiredCapabilities, the tokens it
// needs from whatever renderer/shell hosts it — so a host can check it PROVIDES them all instead of
// rendering a broken screen. Compatibility by capability, not by version. Most tokens are DERIVED
// from the app's own metadata (it needs command-center because it opted in); a developer can
// DECLARE extra ones via [App(Requires = new[]{...})]. (C# mirror of Java's CapabilitiesSyncTest.)

[App("Caps Plain App")]
public class CapsPlainApp
{
    [MenuItem("Things")] public Things Home() => new();
}

[App("Caps Rich App", CommandCenter = true, Requires = new[] { "my-custom-widget" })]
public class CapsRichApp
{
    [MenuItem("Things")] public Things Home() => new();
}

public class CapabilitiesTests
{
    private static AppMetadataDto App(Type app)
    {
        var handler = new SyncHandler(new MateuRegistry(typeof(CapsPlainApp).Assembly));
        var increment = handler.Handle(new RunActionRqDto { ServerSideType = app.FullName });
        return (AppMetadataDto)((ClientSideComponentDto)increment.Fragments.Single().Component!).Metadata;
    }

    [Fact]
    public void A_plain_app_does_not_require_features_it_never_declared()
    {
        // It may still carry ambient, deployment-wide capabilities — but never a feature this
        // particular app did not opt into.
        var caps = App(typeof(CapsPlainApp)).RequiredCapabilities;
        Assert.DoesNotContain(Capabilities.CommandCenter, caps);
        Assert.DoesNotContain("my-custom-widget", caps);
    }

    [Fact]
    public void A_derived_capability_is_advertised()
    {
        // command center opted in → the app needs a renderer that provides it.
        Assert.Contains(Capabilities.CommandCenter, App(typeof(CapsRichApp)).RequiredCapabilities);
    }

    [Fact]
    public void An_explicitly_declared_capability_is_advertised()
    {
        Assert.Contains("my-custom-widget", App(typeof(CapsRichApp)).RequiredCapabilities);
    }

    [Fact]
    public void The_descriptor_is_sorted_and_deduped()
    {
        var caps = App(typeof(CapsRichApp)).RequiredCapabilities;
        Assert.Equal(caps.OrderBy(c => c, StringComparer.Ordinal).ToList(), caps);
        Assert.Equal(caps.Distinct().Count(), caps.Count);
    }
}
