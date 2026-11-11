using System.Reflection;
using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Nodes;
using Mateu.Core;
using Mateu.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace Mateu.AspNetCore.Testing;

/// <summary>
/// Tests a Mateu UI with no browser and no server: registers Mateu exactly as
/// <c>AddMateu</c> does in the app, then opens routes the way a renderer would and lets the test
/// read what renders (<see cref="MateuScreen"/>), type into fields and press buttons. What a test
/// reads is the <c>/mateu/v3/sync</c> answer every renderer receives, so a passing test means the
/// screen really looks and behaves that way.
/// <code>
/// using var mateu = MateuTest.Start(typeof(Shell).Assembly);
/// var products = mateu.Open("/products");
/// Assert.Equal(4, products.Listing().Rows.Count);
/// </code>
/// EXPERIMENTAL (3.0): the API may still change.
/// </summary>
public sealed class MateuTest : IDisposable
{
    private readonly ServiceProvider _services;
    private readonly SyncHandler _handler;
    private readonly IHttpContextAccessor _accessor;

    private MateuTest(Action<MateuOptions> configure, Action<IServiceCollection> services, Assembly[] assemblies)
    {
        var collection = new ServiceCollection();
        collection.AddLogging();
        services(collection);
        collection.AddMateu(configure, assemblies);
        _services = collection.BuildServiceProvider();
        _handler = _services.GetRequiredService<SyncHandler>();
        _accessor = _services.GetRequiredService<IHttpContextAccessor>();
    }

    /// <summary>A harness serving the [UI]/[App] classes of <paramref name="assemblies"/>.</summary>
    public static MateuTest Start(params Assembly[] assemblies) => new(_ => { }, _ => { }, assemblies);

    /// <summary>A harness with the app's own services (the stores its views use, an ITranslator…)
    /// and Mateu options, registered as in the app.</summary>
    public static MateuTest Start(Action<IServiceCollection> services, Action<MateuOptions>? configure = null,
        params Assembly[] assemblies) => new(configure ?? (_ => { }), services, assemblies);

    /// <summary>A signed-in user with these roles, for the access rules ([EyesOnly],
    /// [ReadOnlyUnless], [DisabledUnless]) — read through the app's identity mapping.</summary>
    public static ClaimsPrincipal User(string name, params string[] roles) =>
        new(new ClaimsIdentity(
            new[] { new Claim(ClaimTypes.Name, name) }.Concat(roles.Select(r => new Claim(ClaimTypes.Role, r))),
            authenticationType: "test"));

    /// <summary>Opens a route as an anonymous visitor, the way a browser landing on it does.</summary>
    public MateuScreen Open(string route) => Open(route, null);

    /// <summary>Opens a route as <paramref name="user"/> (null = anonymous).</summary>
    public MateuScreen Open(string route, ClaimsPrincipal? user)
    {
        var screen = new MateuScreen(this, user);
        screen.Navigate(route);
        return screen;
    }

    /// <summary>The raw exchange: sends one request (the JSON a renderer posts) and returns the
    /// answer as the wire JSON.</summary>
    public JsonObject Exchange(JsonObject request, ClaimsPrincipal? user = null)
    {
        var rq = request.Deserialize<RunActionRqDto>(MateuExtensions.Json) ?? new RunActionRqDto();
        var context = new DefaultHttpContext();
        if (user is not null) context.User = user;
        var previous = _accessor.HttpContext;
        _accessor.HttpContext = context;
        UIIncrementDto increment;
        try
        {
            increment = _handler.Handle(rq);
        }
        catch (Exception e) when (MateuErrors.IsForTheUser(MateuErrors.Unwrap(e)))
        {
            // what the endpoint's error boundary answers: the message, as written
            increment = MateuErrors.Increment(e, "test", detailed: false);
        }
        finally
        {
            _accessor.HttpContext = previous;
        }
        return JsonSerializer.SerializeToNode(increment, MateuExtensions.Json)!.AsObject();
    }

    /// <summary>Releases the services the harness built.</summary>
    public void Dispose() => _services.Dispose();
}
