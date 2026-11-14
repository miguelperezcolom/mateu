using System.Security.Claims;
using Mateu.AspNetCore.Testing;
using Xunit;

namespace Workshop.Tests;

/// <summary>Workshop, lab 06: the access rule, tested with no Keycloak at all — the harness opens
/// the screen as a given user, exactly as Mateu reads the HttpContext.User the token produced.</summary>
public class SignInUiTests
{
    [Fact]
    public void A_clerk_sees_no_discount()
    {
        using var mateu = MateuTest.Start(typeof(Quote).Assembly);
        Assert.False(mateu.Open("/quote", MateuTest.User("bob", "clerk")).HasField("discount"));
    }

    [Fact]
    public void Anonymous_sees_no_discount_either()
    {
        using var mateu = MateuTest.Start(typeof(Quote).Assembly);
        Assert.False(mateu.Open("/quote").HasField("discount"));
    }

    [Fact]
    public void A_manager_gives_a_discount()
    {
        using var mateu = MateuTest.Start(typeof(Quote).Assembly);
        var quote = mateu.Open("/quote", MateuTest.User("ada", "manager"));
        quote.Field("quantity").Set(2);
        quote.Field("unitPrice").Set(50.0);
        quote.Field("discount").Set(20);
        quote.Button("Calculate").Press();
        Assert.Equal(80.0, quote.Field("total").Value!.GetValue<double>());
    }

    [Fact]
    public void The_roles_claims_of_a_keycloak_token_count()
    {
        // what JwtBearer makes of an access token of labs/06-sign-in/keycloak (MapInboundClaims = false)
        var ada = new ClaimsPrincipal(new ClaimsIdentity(
            [new Claim("preferred_username", "ada"), new Claim("roles", "manager")], "Bearer"));
        using var mateu = MateuTest.Start(typeof(Quote).Assembly);
        Assert.True(mateu.Open("/quote", ada).HasField("discount"));
    }
}
