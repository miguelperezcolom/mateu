using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>W-V-TABLE-ID: a listing whose rows open by click leaves its technical id out of the
/// columns (Java TechnicalIdColumnTest, Python test_technical_id_column.py).</summary>
public class TechnicalIdColumnTests
{
    public class Generated { public Guid Id { get; set; } public string Name { get; set; } = ""; }
    public class Named { [Label("Code")] public string Id { get; set; } = ""; public string Name { get; set; } = ""; }
    public class Declared { [Id] public string Reference { get; set; } = ""; public string Id { get; set; } = ""; public string Name { get; set; } = ""; }
    public class OnlyId { public string Id { get; set; } = ""; }

    private static string[] Names(Type t, bool clickable = true) =>
        ReflectionMapper.WithoutTechnicalId(t.GetProperties(), t, clickable).Select(p => p.Name).ToArray();

    [Fact]
    public void The_declared_id_is_left_out_whatever_its_type() =>
        Assert.Equal(["Name"], Names(typeof(Generated)));

    [Fact]
    public void A_labelled_id_is_a_column_the_developer_wants_shown() =>
        Assert.Equal(["Id", "Name"], Names(typeof(Named)));

    [Fact]
    public void The_Id_attribute_names_the_id_and_a_property_called_Id_is_then_data() =>
        Assert.Equal(["Id", "Name"], Names(typeof(Declared)));

    [Fact]
    public void Rows_that_do_not_open_keep_their_id() =>
        Assert.Equal(["Id", "Name"], Names(typeof(Generated), clickable: false));

    [Fact]
    public void The_only_column_stays() => Assert.Equal(["Id"], Names(typeof(OnlyId)));
}
