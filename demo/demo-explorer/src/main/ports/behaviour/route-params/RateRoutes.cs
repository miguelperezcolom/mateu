// The C# twin (Mateu.NET): an IRouteEntrySupplier with the same RouteEntry model (path params,
// fixed and default params). Same precedence: fixed > client state > path > query > defaults.
using Mateu.Core;

public class RateRoutes : IRouteEntrySupplier
{
    public IReadOnlyList<RouteEntry> Routes() =>
    [
        new("rates/web/:hotel", null, typeof(RateQuote).FullName,
            FixedParams: new Dictionary<string, object?> { ["channel"] = "web" },
            DefaultParams: new Dictionary<string, object?> { ["currency"] = "EUR", ["nights"] = 1 }),
        new("rates/agents/:hotel", null, typeof(RateQuote).FullName,
            FixedParams: new Dictionary<string, object?> { ["channel"] = "travel agents" },
            DefaultParams: new Dictionary<string, object?> { ["currency"] = "EUR", ["nights"] = 1 }),
    ];
}
