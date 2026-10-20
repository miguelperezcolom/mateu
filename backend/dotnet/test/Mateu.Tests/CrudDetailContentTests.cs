using System.Text.Json;
using System.Text.Json.Serialization;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>What the workshop's student overview is: an item overview built from the record.</summary>
public class DetailStudentOverview(DetailStudent student) : ItemOverview
{
    public IComponent KeyInfo { get; } = new VerticalLayout
    {
        Content = [new Text("Email: " + student.Email), new Button("Edit", "edit")],
    };

    [Panel(Title = "Personal data")]
    public Text Personal { get; } = new("Name: " + student.Name);

    [Panel(Title = "Enrolment")]
    public Text Enrolment { get; } = new("Enrolled since 2024");
}

public class DetailStudent : IDetailContentSupplier
{
    public string Id { get; set; } = "";
    public string Name { get; set; } = "";
    public string? Email { get; set; }

    public override string ToString() => Name;

    // a record can keep the default read-only form (here: the one with no email)
    public IComponent? DetailContent() => Email is null ? null : new DetailStudentOverview(this).Component();
}

[UI("detail-students"), Title("Students")]
public class DetailStudents : Crud<DetailStudent>
{
    public override IEnumerable<DetailStudent> Fetch(string? search) =>
    [
        new() { Id = "1", Name = "Ada Lovelace", Email = "ada@example.com" },
        new() { Id = "2", Name = "Alan Turing" },
    ];

    public override void Save(DetailStudent entity) { }
}

/// <summary>IDetailContentSupplier: a crud's record page shows the content its record supplies (an
/// item overview: key-info card + tabs) instead of the read-only form, under the crud's own title and
/// toolbar; the edit and create forms of the same class keep their forms (Java's
/// CrudDetailContentSyncTest).</summary>
public class CrudDetailContentTests
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.Never,
    };

    private static string Open(string route) => JsonSerializer.Serialize(
        new SyncHandler(new MateuRegistry(typeof(DetailStudents).Assembly)).Handle(new RunActionRqDto
        {
            Route = route,
            ConsumedRoute = "/detail-students",
            ServerSideType = typeof(DetailStudents).FullName,
            ActionId = "",
            InitiatorComponentId = "c1",
            Parameters = new(),
            ComponentState = new(),
        }), Json);

    [Fact]
    public void The_record_page_keeps_the_cruds_title_and_toolbar()
    {
        var json = Open("/detail-students/1");
        Assert.Contains("\"title\":\"Ada Lovelace\"", json);
        Assert.Contains("\"actionId\":\"cancel-view\"", json);
        Assert.Contains("\"actionId\":\"edit\"", json);
    }

    [Fact]
    public void The_record_page_content_is_the_one_the_record_supplies()
    {
        var json = Open("/detail-students/1");
        Assert.Contains("\"type\":\"TabLayout\"", json);
        Assert.Contains("Email: ada@example.com", json);
        Assert.Contains("Name: Ada Lovelace", json);
        Assert.DoesNotContain("\"fieldId\":\"name\"", json);
    }

    [Fact]
    public void A_record_that_supplies_nothing_keeps_the_read_only_form()
    {
        var json = Open("/detail-students/2");
        Assert.DoesNotContain("\"type\":\"TabLayout\"", json);
        Assert.Contains("\"fieldId\":\"name\"", json);
    }

    [Theory]
    [InlineData("/detail-students/1/edit")]
    [InlineData("/detail-students/new")]
    public void The_edit_and_create_forms_are_not_affected(string route)
    {
        var json = Open(route);
        Assert.DoesNotContain("\"type\":\"TabLayout\"", json);
        Assert.Contains("\"fieldId\":\"name\"", json);
    }
}
