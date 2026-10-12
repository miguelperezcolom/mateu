using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>AppContext switches are process-wide and cannot be unset: the test flips them, so it
/// must not run next to the rest of the suite.</summary>
[CollectionDefinition("InferenceSwitches", DisableParallelization = true)]
public class InferenceSwitchesCollection;

public class SwitchPlain { public string? Name { get; set; } }

[AutoLayout(false)]
public class SwitchOptedOut { public string? Name { get; set; } }

/// <summary>One naming scheme for the global inference switches (mirror of Java's
/// InferenceSwitchesTest): "Mateu.LayoutInference.Enabled" / "Mateu.PageInference.Enabled", the old
/// names kept as deprecated aliases. One sequential test: a switch, once set, stays set for the
/// process, so the legacy names are exercised before the new ones exist.</summary>
[Collection("InferenceSwitches")]
public class InferenceSwitchesTests
{
    [Fact]
    public void Old_names_work_new_names_win_and_attributes_win_over_both()
    {
        try
        {
            // nothing configured: layout off, page on
            Assert.False(InferenceSwitches.LayoutInferenceEnabled());
            Assert.True(InferenceSwitches.PageInferenceEnabled());

            // the deprecated names keep working (page keeps its inverted polarity)
            AppContext.SetSwitch(InferenceSwitches.LegacyLayout, true);
            AppContext.SetSwitch(InferenceSwitches.LegacyPageDisabled, true);
            Assert.True(InferenceSwitches.LayoutInferenceEnabled());
            Assert.False(InferenceSwitches.PageInferenceEnabled());

            // the new names win over the old ones
            AppContext.SetSwitch(InferenceSwitches.Layout, false);
            AppContext.SetSwitch(InferenceSwitches.Page, true);
            Assert.False(InferenceSwitches.LayoutInferenceEnabled());
            Assert.True(InferenceSwitches.PageInferenceEnabled());

            // an attribute on the class wins over the switch
            AppContext.SetSwitch(InferenceSwitches.Layout, true);
            Assert.True(LayoutInference.Enabled(typeof(SwitchPlain)));
            Assert.False(LayoutInference.Enabled(typeof(SwitchOptedOut)));
        }
        finally
        {
            // back to the defaults, stated with the new names (which are consulted first)
            AppContext.SetSwitch(InferenceSwitches.LegacyLayout, false);
            AppContext.SetSwitch(InferenceSwitches.LegacyPageDisabled, false);
            AppContext.SetSwitch(InferenceSwitches.Layout, false);
            AppContext.SetSwitch(InferenceSwitches.Page, true);
        }
    }
}
