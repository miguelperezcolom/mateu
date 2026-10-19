using Mateu.AspNetCore;
using Mateu.Core;
using Mateu.Dtos;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Mateu.Tests;

// The MCP tool boundary: a refused request must reach the MCP service as an exception (it answers
// the tool error "Forbidden"), every other failure is answered like a screen error.
public class McpGuardTests
{
    private static HttpContext Ctx() =>
        new DefaultHttpContext { RequestServices = new ServiceCollection().BuildServiceProvider() };

    private static readonly RunActionRqDto Rq = new() { Route = "/r", ActionId = "go" };

    [Fact]
    public void A_successful_call_answers_what_it_ran()
    {
        var expected = UIIncrementDto.Of();
        Assert.Same(expected, MateuExtensions.GuardMcp(Ctx(), Rq, () => expected));
    }

    [Fact]
    public void A_refused_call_is_rethrown_for_the_mcp_service_to_answer_forbidden()
    {
        Assert.Throws<MateuForbiddenException>(() =>
            MateuExtensions.GuardMcp(Ctx(), Rq, () => throw new MateuForbiddenException("no")));
    }

    [Fact]
    public void Any_other_failure_is_answered_with_the_generic_error_never_its_message()
    {
        var inc = MateuExtensions.GuardMcp(Ctx(), Rq, () => throw new InvalidOperationException("db password is hunter2"));
        Assert.NotEmpty(inc.Messages);
        Assert.DoesNotContain(inc.Messages, m => (m.Text ?? "").Contains("hunter2") || (m.Title ?? "").Contains("hunter2"));
    }
}

// The sync endpoint's boundary: a refusal answers 403 with the "Forbidden" message, any other
// failure an error increment (HTTP 200), a request the client abandoned answers nothing.
public class RunGuardedTests
{
    private static DefaultHttpContext Ctx() =>
        new() { RequestServices = new ServiceCollection().BuildServiceProvider() };

    private static readonly RunActionRqDto Rq = new() { Route = "/r", ActionId = "go" };

    [Fact]
    public async Task A_refusal_answers_403_with_the_forbidden_message()
    {
        var ctx = Ctx();
        var inc = await MateuExtensions.RunGuarded(ctx, Rq, () => throw new MateuForbiddenException("no"));
        Assert.Equal(StatusCodes.Status403Forbidden, ctx.Response.StatusCode);
        Assert.Contains(inc.Messages, m => m.Text == "Forbidden");
    }

    [Fact]
    public async Task Any_other_failure_answers_an_error_increment_with_status_200()
    {
        var ctx = Ctx();
        var inc = await MateuExtensions.RunGuarded(ctx, Rq, () => throw new InvalidOperationException("boom"));
        Assert.Equal(StatusCodes.Status200OK, ctx.Response.StatusCode);
        Assert.NotEmpty(inc.Messages);
    }

    [Fact]
    public async Task A_request_the_client_abandoned_answers_nothing()
    {
        using var cts = new CancellationTokenSource();
        cts.Cancel();
        var ctx = Ctx();
        ctx.RequestAborted = cts.Token;
        var inc = await MateuExtensions.RunGuarded(ctx, Rq, () => throw new OperationCanceledException(cts.Token));
        Assert.Empty(inc.Messages);
    }
}
