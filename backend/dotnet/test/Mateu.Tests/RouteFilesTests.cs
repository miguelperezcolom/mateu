using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

/// <summary>
/// Every authored route file, not only <c>routes.yaml</c> — the .NET mirror of Java's discovery
/// and of Python's test_route_files: the files a <c>type: UI</c> mount lists (relative to the
/// mount) and any <c>type: Routes</c> file no mount lists (relative to its own <c>basePath</c>).
/// </summary>
public class RouteFilesTests
{
    [Fact]
    public void Route_files_listed_by_a_mount_and_standalone_type_Routes_files_are_read()
    {
        var dir = Directory.CreateTempSubdirectory("mateu-route-files").FullName;
        File.WriteAllText(Path.Combine(dir, "shop.ui.yaml"), "type: UI\nbasePath: /shop\nroutes: [shop-routes.yaml, more.yaml]\n");
        File.WriteAllText(Path.Combine(dir, "shop-routes.yaml"), "type: Routes\nroutes:\n  - {route: orders, layout: orders.yaml}\n");
        File.WriteAllText(Path.Combine(dir, "more.yaml"), "routes:\n  - {route: customers, layout: customers.yaml}\n");
        File.WriteAllText(Path.Combine(dir, "routes.yaml"), "routes:\n  - {route: about, layout: about.yaml}\n");
        File.WriteAllText(Path.Combine(dir, "back-office.yaml"), "type: Routes\nbasePath: /back\nroutes:\n  - {route: users, layout: users.yaml}\n");
        File.WriteAllText(Path.Combine(dir, "orders.yaml"), "type: Text\ntext: not a route file\n");

        var registry = new RouteRegistry(dir);

        Assert.Equal("orders.yaml", registry.Match("shop/orders")?.Entry.Definition);
        Assert.Equal("customers.yaml", registry.Match("shop/customers")?.Entry.Definition);
        Assert.Equal("about.yaml", registry.Match("about")?.Entry.Definition);
        Assert.Equal("users.yaml", registry.Match("back/users")?.Entry.Definition);
    }
}
