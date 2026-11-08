namespace Mateu.Uidl;

// Editable views and master-detail views — C# analogues of Java's orchestrators
// io.mateu.core.infra.declarative.orchestrators.editableview.{EditableView, AutoEditableView} and
// ...masterdetail.{MasterDetailView, NoSelection}. Java runs them as MultiView mediators; this port
// renders their pages directly (like its Crud<T>), with the same toolbar/action ids and routes.

/// <summary>The framework's view of an <see cref="EditableView{TView,TEditor}"/> (plumbing: implement
/// the abstract class, not this).</summary>
public interface IEditableView
{
    /// <summary>A read-only view: no Edit button, and <c>edit</c>/<c>save</c>/<c>/edit</c> refused (403).</summary>
    bool ReadOnly { get; }

    /// <summary>The read model shown on the view page.</summary>
    object LoadView();

    /// <summary>The editor shown on the edit page (the edited values are bound onto it on save).</summary>
    object LoadEditor();

    /// <summary>Saves the editor bound with what the user typed.</summary>
    void SaveEditor(object editor);
}

/// <summary>A read view with an <b>Edit</b> toolbar button that flips it to an editor
/// (<c>/edit</c>) and back: <b>Save</b> (action <c>save</c>, validated on the client and re-checked on
/// the server) persists and lands on <c>/view</c> with a "Saved successfully" toast and the unsaved
/// changes cleared; <b>Cancel</b> (<c>cancel-edit</c>) goes back without saving. A <c>[ReadOnly]</c>
/// view (or <see cref="ReadOnly"/> overridden) offers no Edit and refuses the edit route and the
/// <c>edit</c>/<c>save</c> actions (403). Embedded in a host form as an island (a property typed
/// with it, <c>[Inline]</c> for no page chrome), the flips happen in place. The view's own writable
/// properties are its context: bound from the state on every request, seeded into the page state.
/// (C# analogue of Java's EditableView.)</summary>
public abstract class EditableView<TView, TEditor> : IEditableView
    where TView : class
    where TEditor : class
{
    /// <summary>Whether the view is read-only; false unless overridden (a class-level
    /// <c>[ReadOnly]</c> makes it read-only too).</summary>
    public virtual bool ReadOnly => false;

    /// <summary>The read model of the view page.</summary>
    public abstract TView View();

    /// <summary>The editor of the edit page, as it starts (the typed values are bound onto it).</summary>
    public abstract TEditor Editor();

    /// <summary>Persists the edited <paramref name="editor"/>.</summary>
    public abstract void Save(TEditor editor);

    object IEditableView.LoadView() => View();
    object IEditableView.LoadEditor() => Editor();
    void IEditableView.SaveEditor(object editor) => Save((TEditor)editor);
}

/// <summary>An <see cref="EditableView{TView,TEditor}"/> whose view and editor are the same entity:
/// <see cref="Load"/> it, <see cref="Persist"/> it. (C# analogue of Java's AutoEditableView.)</summary>
public abstract class AutoEditableView<T> : EditableView<T, T> where T : class
{
    /// <summary>The entity shown and edited.</summary>
    public abstract T Load();

    /// <summary>Persists the edited entity (its constraints were re-checked on the server first).</summary>
    public abstract void Persist(T entity);

    public override T View() => Load();
    public override T Editor() => Load();
    public override void Save(T editor) => Persist(editor);
}

/// <summary>What a <see cref="MasterDetailView"/> shows in the detail pane before a part is picked.
/// (C# analogue of Java's NoSelection.)</summary>
public enum NoSelection
{
    /// <summary>Pre-select and show the first declared part.</summary>
    First,
    /// <summary>Show nothing but the button bar until the user picks a part.</summary>
    Empty,
}

/// <summary>Marks a property of a <see cref="MasterDetailView"/> as (part of) a DETAIL PART: shown
/// only while its part's button in the page's button bar is the selected one. The properties that
/// share a <see cref="Key"/> are one part (this port's forms are flat: a part is a set of properties,
/// typically one [Section], or a single embedded view / component property). <see cref="Key"/>
/// defaults to the property name (camelCase), <see cref="Label"/> to the first declared label, else
/// the humanized name. (C# analogue of Java's @DetailPart.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class DetailPartAttribute : Attribute
{
    public string Label { get; set; } = "";
    public string Key { get; set; } = "";
    public int Order { get; set; }
}

/// <summary>The framework's view of a <see cref="MasterDetailView"/> (plumbing).</summary>
public interface IMasterDetailView
{
    void LoadParts();
    NoSelection WhenNothingSelected { get; }
    string? PageTitle();
    IReadOnlyList<IComponent> PageHeader();
}

/// <summary>Reusable master-detail page: the <b>master</b> fields are always visible; a <b>button
/// bar</b> (the page toolbar, the selected part's button primary) selects one of several <b>detail
/// parts</b> — properties marked <see cref="DetailPartAttribute"/> — shown on demand. Declare the
/// sections as properties (<c>[Section]</c>, <c>[Zones]</c> for side by side) and populate them in
/// <see cref="Load"/>. A pick (<c>__md_pick:&lt;key&gt;</c>) emits the
/// <c>mateu-md:part-selected</c> event the page subscribes to (<c>__md_reload</c>), which re-renders
/// it with that part — the same wire as Java's; the selection persists in the page state and a
/// <c>…/__md/&lt;key&gt;</c> route opens on it. (C# analogue of Java's MasterDetailView.)</summary>
public abstract class MasterDetailView : IMasterDetailView
{
    /// <summary>Populates the section properties (master + parts); called on every render.</summary>
    protected abstract void Load();

    /// <summary>What to show before a part is picked (default: the first part).</summary>
    protected virtual NoSelection NoSelection => NoSelection.First;

    /// <summary>The page title; null = the [Title] / class name.</summary>
    protected virtual string? Title() => null;

    /// <summary>A context strip above the panes (called after <see cref="Load"/>); empty by default.</summary>
    protected virtual IReadOnlyList<IComponent> Header() => [];

    void IMasterDetailView.LoadParts() => Load();
    NoSelection IMasterDetailView.WhenNothingSelected => NoSelection;
    string? IMasterDetailView.PageTitle() => Title();
    IReadOnlyList<IComponent> IMasterDetailView.PageHeader() => Header();
}
