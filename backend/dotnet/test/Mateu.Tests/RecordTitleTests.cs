using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

// ── Fixtures ─────────────────────────────────────────────────────────────────────────────────────

/// <summary>An entity that NAMES itself: its ToString is the developer's ("Bolt M8").</summary>
public class Fastener
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public override string ToString() => Name;
}

[UI("fasteners"), Title("Fasteners")]
public class Fasteners : Crud<Fastener>
{
    public static readonly List<Fastener> All = [new() { Id = "b1", Name = "Bolt M8" }, new() { Id = "w1", Name = "Washer ${size}" }];
    public override IEnumerable<Fastener> Fetch(string? search) => All;
    public override Fastener? Get(string id) => All.FirstOrDefault(f => f.Id == id);
}

/// <summary>An entity with NO ToString of its own (object's is a type name, not a record name).</summary>
public class Anonymous
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
}

[UI("anonymous-records"), Title("Anonymous records")]
public class AnonymousRecords : Crud<Anonymous>
{
    public override IEnumerable<Anonymous> Fetch(string? search) => [new() { Id = "a1", Name = "First" }];
    public override Anonymous? Get(string id) => new() { Id = id, Name = "First" };
}

/// <summary>A C# record: its compiler-generated ToString (<c>Note { Id = n1, Text = … }</c>) is a
/// field dump, not a name.</summary>
public record Note(string Id, string Text)
{
    public Note() : this("", "") { }
}

[UI("notes-records"), Title("Notes")]
public class Notes : Crud<Note>
{
    public override IEnumerable<Note> Fetch(string? search) => [new("n1", "Buy milk")];
    public override Note? Get(string id) => new(id, "Buy milk");
}

/// <summary>A record whose ToString the DEVELOPER wrote names it, record or not.</summary>
public record NamedNote(string Id, string Text)
{
    public NamedNote() : this("", "") { }
    public override string ToString() => "Note " + Id;
}

[UI("named-notes"), Title("Named notes")]
public class NamedNotes : Crud<NamedNote>
{
    public override IEnumerable<NamedNote> Fetch(string? search) => [new("n1", "Buy milk")];
    public override NamedNote? Get(string id) => new(id, "Buy milk");
}

/// <summary>A declared [Title] on the entity wins over its ToString.</summary>
[Title("Customer file")]
public class TitledCustomer
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public override string ToString() => Name;
}

[UI("titled-customers"), Title("Customers")]
public class TitledCustomers : Crud<TitledCustomer>
{
    public override IEnumerable<TitledCustomer> Fetch(string? search) => [new() { Id = "c1", Name = "Ann" }];
    public override TitledCustomer? Get(string id) => new() { Id = id, Name = "Ann" };
}

/// <summary>A plain [UI] form whose instance names itself — the same rule, not only cruds.</summary>
[UI("self-named-form")]
public class SelfNamedForm
{
    public string Name { get; set; } = "Draft";
    public override string ToString() => "Form of " + Name;
}

/// <summary>A capability listing (INavigable) whose detail names itself.</summary>
[UI("fastener-catalogue"), Title("Fastener catalogue")]
public class FastenerCatalogue : IListing<Fastener>, INavigable<Fastener, string>
{
    public ListingData<Fastener> Search(SearchRequest request) => ListingData.From(Fasteners.All);
    public Fastener View(string id) => Fasteners.All.First(f => f.Id == id);
}

/// <summary>A record page is named after the RECORD, as Java names it (PageMetadataExtractor.getTitle,
/// used by CrudFormComponentBuilder / EditableView): the entity's declared [Title], else a ToString
/// the developer wrote, else the humanized class name — never the crud's title ("Fasteners") and
/// never a record's compiler-generated field dump. Both the page header and the window title.</summary>
public class RecordTitleTests
{
    private static SyncHandler Handler() => new(new MateuRegistry(typeof(Fasteners).Assembly));

    private static UIIncrementDto Load(Type uiClass, string route) =>
        Handler().Handle(new RunActionRqDto
        {
            Route = route, ConsumedRoute = route, ServerSideType = uiClass.FullName, ActionId = "",
            InitiatorComponentId = "rt_app",
        });

    private static PageMetadataDto? FindPage(ComponentDto? component)
    {
        if (component is ClientSideComponentDto { Metadata: PageMetadataDto page }) return page;
        var children = component switch
        {
            ClientSideComponentDto c => c.Children,
            ServerSideComponentDto s => s.Children,
            _ => null,
        };
        foreach (var child in children ?? [])
            if (FindPage(child) is { } found) return found;
        return null;
    }

    private static (string? PageTitle, string? WindowTitle) TitlesOf(Type uiClass, string route)
    {
        var inc = Load(uiClass, route);
        var page = inc.Fragments.Select(f => FindPage(f.Component)).FirstOrDefault(p => p is not null);
        var window = inc.Commands.FirstOrDefault(c => c.Type == "SetWindowTitle")?.Data as string;
        return (page?.Title, window);
    }

    [Fact]
    public void A_record_that_names_itself_titles_its_edit_page_and_the_window()
    {
        var (page, window) = TitlesOf(typeof(Fasteners), "fasteners/b1/edit");
        Assert.Equal("Bolt M8", page);
        Assert.Equal("Bolt M8", window);
    }

    [Fact]
    public void The_view_page_is_named_after_the_record_too()
    {
        Assert.Equal(("Bolt M8", "Bolt M8"), TitlesOf(typeof(Fasteners), "fasteners/b1"));
    }

    [Fact]
    public void The_listing_keeps_the_cruds_declared_title()
    {
        var (page, window) = TitlesOf(typeof(Fasteners), "fasteners");
        Assert.Equal("Fasteners", window);
        Assert.Null(page); // the crud's title rides on the listing, not on a page
    }

    // NM12: a title that is DATA travels marked TitleIsText, so the web header renders it as text —
    // whoever names a record cannot plant markup (a beacon image, a phishing link) in it.
    [Fact]
    public void A_record_title_is_marked_text_and_a_declared_one_is_not()
    {
        static PageMetadataDto? PageOf(Type ui, string route)
        {
            var inc = Load(ui, route);
            return inc.Fragments.Select(f => FindPage(f.Component)).FirstOrDefault(p => p is not null);
        }
        Assert.True(PageOf(typeof(Fasteners), "fasteners/b1/edit")!.TitleIsText);
        Assert.True(PageOf(typeof(Fasteners), "fasteners/b1")!.TitleIsText);
        Assert.Null(PageOf(typeof(AnonymousRecords), "anonymous-records/a1/edit")!.TitleIsText);
        Assert.Null(PageOf(typeof(Notes), "notes-records/n1/edit")!.TitleIsText);
    }

    [Fact]
    public void A_records_text_is_data_not_a_template()
    {
        // "Washer ${size}" must not be interpolated by the renderer (Java's Templates.literal)
        Assert.Equal("Washer \\${size}", TitlesOf(typeof(Fasteners), "fasteners/w1").PageTitle);
    }

    [Fact]
    public void An_entity_without_its_own_tostring_is_titled_by_its_class_name_not_the_cruds()
    {
        Assert.Equal(("Anonymous", "Anonymous"), TitlesOf(typeof(AnonymousRecords), "anonymous-records/a1/edit"));
    }

    [Fact]
    public void A_records_generated_tostring_is_a_field_dump_not_a_name()
    {
        Assert.Equal(("Note", "Note"), TitlesOf(typeof(Notes), "notes-records/n1/edit"));
    }

    [Fact]
    public void A_tostring_the_record_declares_itself_names_it()
    {
        Assert.Equal(("Note n1", "Note n1"), TitlesOf(typeof(NamedNotes), "named-notes/n1"));
    }

    [Fact]
    public void A_declared_title_on_the_entity_wins_over_its_tostring()
    {
        Assert.Equal(("Customer file", "Customer file"), TitlesOf(typeof(TitledCustomers), "titled-customers/c1/edit"));
    }

    [Fact]
    public void The_new_form_is_titled_by_the_class_when_the_blank_record_has_no_name()
    {
        // a fresh Fastener's Name is "" — an empty name falls back to the class
        Assert.Equal(("Fastener", "Fastener"), TitlesOf(typeof(Fasteners), "fasteners/new"));
    }

    [Fact]
    public void A_plain_form_that_names_itself_is_titled_by_its_instance()
    {
        Assert.Equal(("Form of Draft", "Form of Draft"), TitlesOf(typeof(SelfNamedForm), "self-named-form"));
    }

    [Fact]
    public void A_capability_listings_detail_is_named_after_the_record()
    {
        Assert.Equal(("Bolt M8", "Bolt M8"), TitlesOf(typeof(FastenerCatalogue), "fastener-catalogue/b1"));
    }
}
