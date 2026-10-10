namespace Mateu.Uidl;

// ── The Redwood pattern-gaps vocabulary (C# mirror of the Java uidl additions: Toggle, the display
// records, Draftable, RecordSwitcher, HeroTone, DockedPanel). Same names, port idioms: properties
// instead of zero-arg methods, parameterless hooks (the port has no HttpRequest), C# enum casing.

/// <summary>The tri-state switch of an affordance an archetype brings built in (the Oracle Redwood
/// <c>displayOptions</c> grammar): <see cref="On"/> — shown and usable; <see cref="Off"/> — not shown;
/// <see cref="Disabled"/> — shown but inert. Consumed server-side while composing: a disabled
/// affordance travels as a disabled button, an off one does not travel at all. (C# mirror of
/// io.mateu.uidl.data.Toggle.)</summary>
public enum Toggle { On, Off, Disabled }

public static class ToggleExtensions
{
    /// <summary>Whether the affordance is drawn at all (On or Disabled).</summary>
    public static bool Shown(this Toggle toggle) => toggle != Toggle.Off;

    /// <summary>Whether the affordance can be used (On only).</summary>
    public static bool Enabled(this Toggle toggle) => toggle == Toggle.On;
}

/// <summary>The built-in affordances of a <see cref="Wizard"/> (the Redwood guided-process
/// displayOptions): the draft buttons of an <see cref="IDraftable"/> wizard ("Save" / "Save and
/// close") and the "Skip" button of <see cref="Wizard.StepSkippable"/> steps. All on by default.
/// (C# mirror of io.mateu.uidl.data.WizardDisplay.)</summary>
public sealed record WizardDisplay(
    Toggle SaveDraft = Toggle.On, Toggle SaveAndClose = Toggle.On, Toggle Skip = Toggle.On)
{
    public static WizardDisplay Defaults { get; } = new();
}

/// <summary>The built-in affordances of a <see cref="Crud{T}"/> (the Redwood collection-container /
/// create-edit-drawer displayOptions), on top of the CanCreate/CanDelete capability hooks: New,
/// Delete, the edit drawer's "Save and next" (default Off) and the drawer error banner (default On).
/// (C# mirror of io.mateu.uidl.data.CrudDisplay.)</summary>
public sealed record CrudDisplay(
    Toggle Create = Toggle.On, Toggle Delete = Toggle.On,
    Toggle SaveAndNext = Toggle.Off, Toggle ErrorBanner = Toggle.On)
{
    public static CrudDisplay Defaults { get; } = new();
}

/// <summary>The built-in affordances of a <see cref="GeneralOverview{TRow}"/>: the contextual
/// <c>info</c> panel (default On) and promoteInfoSlot — stack the info panel ABOVE the main content
/// on narrow pages (default Off). (C# mirror of io.mateu.uidl.data.GeneralOverviewDisplay.)</summary>
public sealed record GeneralOverviewDisplay(Toggle Info = Toggle.On, Toggle PromoteInfoSlot = Toggle.Off)
{
    public static GeneralOverviewDisplay Defaults { get; } = new();
}

/// <summary>A wizard that can be saved half-way and resumed later (the Redwood guided-process
/// saveDraft / saveAndClose / resumeStepId trio). Implementing it adds "Save" and "Save and close"
/// to every step (switchable through <see cref="WizardDisplay"/>). The wizard's state is bound
/// (never validated — a draft may be incomplete) before <see cref="SaveDraft"/> runs. (C# mirror of
/// io.mateu.uidl.interfaces.Draftable.)</summary>
public interface IDraftable
{
    /// <summary>Persists what has been captured so far. Its result is the response; null → a
    /// "Draft saved" notification and the wizard stays on the step.</summary>
    object? SaveDraft();

    /// <summary>Where "Save and close" lands after saving: a route string or a UI command; null
    /// (default) → "/".</summary>
    object? CloseDraft() => null;

    /// <summary>The step (1-based, the [Step(n)] number) to resume on when the wizard opens
    /// afresh, or null for the first step.</summary>
    int? ResumeStep() => null;
}

/// <summary>What a <see cref="RecordSwitcher"/> switches: the record shown (Object) or the context
/// the page is evaluated in (Context). Travels as "object" | "context". (C# mirror of
/// io.mateu.uidl.data.SwitcherType.)</summary>
public enum SwitcherType { Object, Context }

/// <summary>A record/context switcher shown in the page header (the Redwood selectObject /
/// selectContext element): a compact selector next to the title that jumps between records without
/// leaving the page. Supplied by a view implementing <see cref="IRecordSwitcherSupplier"/>.
/// (C# mirror of io.mateu.uidl.data.RecordSwitcher.)</summary>
public sealed record RecordSwitcher(
    IReadOnlyList<Option> Options,
    string? Value,
    SwitcherType Type = SwitcherType.Object,
    string? Label = null,
    bool Searchable = false,
    bool Disabled = false);

/// <summary>Implemented by a view to put a record/context switcher in its header — the sibling of
/// <see cref="IPeerNavigationSupplier"/>. Picking an entry dispatches <see cref="ActionId"/> with the
/// picked value in the <see cref="ValueParameter"/> parameter, which runs <see cref="SwitchTo"/>:
/// return null (or the view itself) to re-render in place after pointing the view at the new record,
/// a route string to navigate, or any other action result. (C# mirror of
/// io.mateu.uidl.interfaces.RecordSwitcherSupplier.)</summary>
public interface IRecordSwitcherSupplier
{
    /// <summary>The action a pick dispatches.</summary>
    const string ActionId = "_switchRecord";

    /// <summary>The action parameter carrying the picked value.</summary>
    const string ValueParameter = "_record";

    /// <summary>The switcher for the current state; null = no switcher.</summary>
    RecordSwitcher? Switcher();

    object? SwitchTo(string? value);
}

/// <summary>The tone of a hero band (the Redwood welcome-page backgroundColor palette, expressed
/// design-system-neutrally): Auto keeps the renderer's default hero; the others paint a DARK tinted
/// band with light ink. Travels as the lowercase hue name (Auto travels as nothing). (C# mirror of
/// io.mateu.uidl.data.HeroTone.)</summary>
public enum HeroTone { Auto, Ocean, Pine, Lilac, Teal, Rose, Pebble, Slate, Plum, Sienna }

/// <summary>A panel docked beside or under a page's main content (the Redwood data-management
/// innerEnd / innerBottom slots): it REFLOWS the content rather than overlaying it. Supplied by
/// <see cref="DataManagement.EndPanel"/> / <see cref="DataManagement.BottomPanel"/>; the page draws a
/// toggle for each and keeps whether it is open in its state. Size is the end panel's width / the
/// bottom panel's max height (null = 22rem / 16rem). (C# mirror of io.mateu.uidl.data.DockedPanel.)</summary>
public sealed record DockedPanel(
    string Id, string Title, IComponent? Content, string? Size = null, bool Open = false);
