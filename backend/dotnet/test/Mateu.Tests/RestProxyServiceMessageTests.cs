using Mateu.Core;
using Xunit;

namespace Mateu.Tests;

/// <summary>What a failed proxied call tells the user: the service's own message (Java's
/// RestProxyServiceMessageTest, Python's test_proxy_service_message and the browser's — same cases).</summary>
public class RestProxyServiceMessageTests
{
    [Fact]
    public void The_usual_error_shapes_give_their_message_in_order()
    {
        Assert.Equal("Image larger than 2 MB",
            SyncHandler.ServiceMessageOf("{\"status\":400,\"error\":\"Bad Request\",\"message\":\"Image larger than 2 MB\"}"));
        Assert.Equal("Name is required", SyncHandler.ServiceMessageOf("{\"title\":\"Invalid\",\"detail\":\"Name is required\"}"));
        Assert.Equal("not allowed", SyncHandler.ServiceMessageOf("{\"error\":\"not allowed\"}"));
        Assert.Equal("quota exceeded", SyncHandler.ServiceMessageOf("{\"error\":{\"message\":\"quota exceeded\"}}"));
        Assert.Equal("Conflict", SyncHandler.ServiceMessageOf("{\"title\":\"Conflict\"}"));
        Assert.Equal("Astronaut still on a crew", SyncHandler.ServiceMessageOf("Astronaut still on a crew"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("  ")]
    [InlineData("<html><body>502</body></html>")]
    [InlineData("[1,2]")]
    [InlineData("{\"status\":500}")]
    [InlineData("{not json")]
    public void Nothing_worth_showing_gives_null(string? body) => Assert.Null(SyncHandler.ServiceMessageOf(body));

    [Fact]
    public void Control_characters_go_and_a_long_message_is_clipped()
    {
        Assert.Null(SyncHandler.ServiceMessageOf(new string('x', 301)));
        Assert.Equal("two lines", SyncHandler.ServiceMessageOf("{\"message\":\"two\\u0007\\n  lines\"}"));
        var clipped = SyncHandler.ServiceMessageOf("{\"message\":\"" + new string('y', 400) + "\"}")!;
        Assert.Equal(300, clipped.Length);
        Assert.EndsWith("…", clipped);
    }
}
