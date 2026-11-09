using System.Text.Json;
using Mateu.Core;
using Mateu.Dtos;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

public enum CritStatus { Confirmed, Cancelled, Pending }

public class CritBooking
{
    public string Id { get; set; } = "";
    public string? Guest { get; set; }
    public DateOnly Arrival { get; set; }
    public CritStatus Status { get; set; }
    [RangeFilter] public decimal Amount { get; set; }
    public int Nights { get; set; }
}

[UI("crit-bookings")]
public class CritBookings : Crud<CritBooking>
{
    public static IReadOnlyList<FilterCriterion>? LastCriteria;

    public override IEnumerable<CritBooking> Fetch(string? search) => [];

    public override PageResult<CritBooking>? Find(string? searchText, IReadOnlyDictionary<string, object?> filters,
        IReadOnlyList<FilterCriterion> criteria, Pageable pageable)
    {
        LastCriteria = criteria;
        return new PageResult<CritBooking>([new CritBooking { Id = "b1", Guest = "Ada" }], 1);
    }
}

/// <summary>A crud that only overrides the older three-argument Find keeps being called.</summary>
[UI("crit-legacy")]
public class CritLegacyBookings : Crud<CritBooking>
{
    public static int Calls;

    public override IEnumerable<CritBooking> Fetch(string? search) => [];

    public override PageResult<CritBooking>? Find(string? searchText, IReadOnlyDictionary<string, object?> filters,
        Pageable pageable)
    {
        Interlocked.Increment(ref Calls);
        return new PageResult<CritBooking>([], 0);
    }
}

/// <summary>The smart search bar's range / multi-select conditions reach a crud's database pushdown
/// TYPED (Java's FilterCriteriaBuilder → CrudStore.find(searchText, filters, criteria, pageable)).</summary>
[Collection(nameof(ProcessWideStateCollection))]
public class FilterCriteriaTests
{
    private static readonly SyncHandler Handler = new(new MateuRegistry(typeof(FilterCriteriaTests).Assembly));
    private static JsonElement J(object? v) => JsonSerializer.SerializeToElement(v);

    private static UIIncrementDto Search(string route, Dictionary<string, object?> state) => Handler.Handle(new RunActionRqDto
    {
        Route = route, ConsumedRoute = route, ActionId = "search", ComponentState = state,
    });

    [Fact]
    public void Ranges_and_multi_selects_arrive_as_typed_criteria()
    {
        Search("crit-bookings", new()
        {
            ["arrival_from"] = J("2026-01-01"), ["arrival_to"] = J("2026-01-31"),
            ["amount_from"] = J("100"),
            ["status"] = J(new[] { "Confirmed", "Gone" }),
            ["nights_from"] = J("3"), // not a [RangeFilter]: no criterion
            ["guest"] = J("Ada"),
        });
        var criteria = CritBookings.LastCriteria!;
        Assert.Equal(3, criteria.Count);
        var arrival = Assert.Single(criteria, c => c.Field == "arrival");
        Assert.Equal(FilterOperator.Between, arrival.Operator);
        Assert.Equal([new DateOnly(2026, 1, 1), new DateOnly(2026, 1, 31)], arrival.Values);
        var amount = Assert.Single(criteria, c => c.Field == "amount");
        Assert.Equal(FilterOperator.Gte, amount.Operator);
        Assert.Equal(100m, Assert.Single(amount.Values));
        var status = Assert.Single(criteria, c => c.Field == "status");
        Assert.Equal(FilterOperator.In, status.Operator);
        Assert.Equal([CritStatus.Confirmed], status.Values); // a stale constant is dropped
    }

    [Fact]
    public void An_upper_bound_alone_is_lte_and_a_comma_joined_value_list_is_in()
    {
        Search("crit-bookings", new()
        {
            ["arrival_to"] = J("2026-02-01"), ["amount_from"] = J(" "),
            ["status"] = J("Cancelled,Pending"),
        });
        var criteria = CritBookings.LastCriteria!;
        Assert.Equal(FilterOperator.Lte, Assert.Single(criteria, c => c.Field == "arrival").Operator);
        Assert.DoesNotContain(criteria, c => c.Field == "amount");
        Assert.Equal([CritStatus.Cancelled, CritStatus.Pending], Assert.Single(criteria, c => c.Field == "status").Values);
    }

    [Fact]
    public void No_filters_no_criteria()
    {
        Search("crit-bookings", new());
        Assert.Empty(CritBookings.LastCriteria!);
    }

    [Fact]
    public void A_three_argument_override_keeps_working()
    {
        var before = CritLegacyBookings.Calls;
        Search("crit-legacy", new() { ["arrival_from"] = J("2026-01-01") });
        Assert.Equal(before + 1, CritLegacyBookings.Calls);
    }

    [Fact]
    public void The_capability_search_hands_its_criteria_to_find()
    {
        var crud = new CritBookings();
        var criteria = new List<FilterCriterion> { new("status", FilterOperator.In, [CritStatus.Pending]) };
        crud.Search(new SearchRequest("", null, criteria));
        Assert.Same(criteria, CritBookings.LastCriteria);
    }
}
