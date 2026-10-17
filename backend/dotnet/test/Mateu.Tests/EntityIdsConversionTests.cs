using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>A route id is a string; <see cref="EntityIds.SetId"/> writes it into the entity's id
/// property converted to that property's type — the keys a crud over a database actually uses.</summary>
public class EntityIdsConversionTests
{
    public enum Region { North, South }

    public class ByGuid { public Guid Id { get; set; } }
    public class ByEnum { [Id] public Region Zone { get; set; } }
    public class ByNullableInt { public int? Id { get; set; } }
    public class ByLong { [Id] public long Number { get; set; } }
    public class ReadOnlyId { public string Id => "fixed"; }
    public class NullId { public string? Id { get; set; } }

    [Fact]
    public void A_guid_id_is_parsed()
    {
        var e = new ByGuid();
        var g = Guid.NewGuid();
        EntityIds.SetId(e, g.ToString());
        Assert.Equal(g, e.Id);
    }

    [Fact]
    public void An_enum_id_is_parsed_by_name()
    {
        var e = new ByEnum();
        EntityIds.SetId(e, "South");
        Assert.Equal(Region.South, e.Zone);
        Assert.Equal("zone", EntityIds.FieldName(typeof(ByEnum)));
    }

    [Fact]
    public void Numeric_ids_are_converted_nullable_or_not()
    {
        var n = new ByNullableInt();
        EntityIds.SetId(n, "42");
        Assert.Equal(42, n.Id);
        var l = new ByLong();
        EntityIds.SetId(l, "9000000000");
        Assert.Equal(9000000000L, l.Number);
        Assert.Equal("9000000000", EntityIds.Of(l));
    }

    [Fact]
    public void A_read_only_id_is_left_alone_and_a_null_id_reads_as_null()
    {
        var r = new ReadOnlyId();
        EntityIds.SetId(r, "other");
        Assert.Equal("fixed", r.Id);
        Assert.Null(EntityIds.Of(new NullId()));
    }
}
