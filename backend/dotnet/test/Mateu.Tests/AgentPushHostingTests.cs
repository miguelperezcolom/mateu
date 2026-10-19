using System.Security.Claims;
using Mateu.AspNetCore;
using Microsoft.AspNetCore.Http;
using Xunit;

namespace Mateu.Tests;

// Who owns a live-push session on ASP.NET Core: the authenticated name, never an anonymous or
// nameless identity (those are owned by their client address instead).
public class AgentPushPrincipalTests
{
    [Fact]
    public void No_user_is_anonymous() =>
        Assert.Null(MateuExtensions.PrincipalName(new DefaultHttpContext()));

    [Fact]
    public void An_unauthenticated_identity_is_anonymous_even_with_a_name() =>
        Assert.Null(MateuExtensions.PrincipalName(new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.Name, "ann")])),
        }));

    [Fact]
    public void An_authenticated_identity_without_a_name_is_anonymous() =>
        Assert.Null(MateuExtensions.PrincipalName(new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity([], "test")),
        }));

    [Fact]
    public void An_authenticated_identity_with_a_name_owns_its_sessions() =>
        Assert.Equal("ann", MateuExtensions.PrincipalName(new DefaultHttpContext
        {
            User = new ClaimsPrincipal(new ClaimsIdentity([new Claim(ClaimTypes.Name, "ann")], "test")),
        }));
}

// The live-push limits: the option wins, then a positive MATEU_MCP_PUSH_* variable, else the default.
[Collection(ProcessWideStateCollection.Name)]
public class AgentPushOptionsTests
{
    [Fact]
    public void An_explicit_option_wins_over_the_environment()
    {
        Environment.SetEnvironmentVariable("MATEU_MCP_PUSH_MAX_SESSIONS_PER_OWNER", "7");
        try
        {
            Assert.Equal(3, new MateuOptions { McpPushMaxSessionsPerOwner = 3 }.PushMaxSessionsPerOwner);
            Assert.Equal(7, new MateuOptions().PushMaxSessionsPerOwner);
        }
        finally
        {
            Environment.SetEnvironmentVariable("MATEU_MCP_PUSH_MAX_SESSIONS_PER_OWNER", null);
        }
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-4")]
    [InlineData("many")]
    public void A_variable_that_is_no_positive_number_keeps_the_default(string value)
    {
        Environment.SetEnvironmentVariable("MATEU_MCP_PUSH_RATE_PER_MINUTE", value);
        try
        {
            Assert.Equal(Mateu.Core.AgentPush.AgentSessions.DefaultRatePerMinute, new MateuOptions().PushRatePerMinute);
        }
        finally
        {
            Environment.SetEnvironmentVariable("MATEU_MCP_PUSH_RATE_PER_MINUTE", null);
        }
    }

    [Fact]
    public void The_global_cap_reads_its_variable()
    {
        Environment.SetEnvironmentVariable("MATEU_MCP_PUSH_MAX_SESSIONS", "50");
        try
        {
            Assert.Equal(50, new MateuOptions().PushMaxSessions);
        }
        finally
        {
            Environment.SetEnvironmentVariable("MATEU_MCP_PUSH_MAX_SESSIONS", null);
        }
    }
}
