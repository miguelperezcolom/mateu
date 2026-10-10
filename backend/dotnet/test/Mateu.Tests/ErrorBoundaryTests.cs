using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Core;
using Mateu.Uidl;
using Xunit;

namespace Mateu.Tests;

/// <summary>The same contract as Java's ErrorBoundarySyncTest: an exception meant for the user is
/// shown as written, a bug becomes a generic message with a reference.</summary>
public class ErrorBoundaryTests
{
    [Fact]
    public void A_user_facing_exception_is_shown_as_written_even_when_wrapped()
    {
        var wrapped = new TargetInvocationException(new UserFacingException("Not enough stock", "Only 3 units left."));
        var (message, reference) = ErrorBoundary.Describe(wrapped, detailed: false);
        Assert.Equal("error", message.Variant);
        Assert.Equal("Not enough stock", message.Title);
        Assert.Equal("Only 3 units left.", message.Text);
        Assert.Null(reference);
        Assert.Equal("Error", ErrorBoundary.Describe(new UserFacingException("Pick a date."), false).Message.Title);
    }

    [Fact]
    public void A_validation_error_is_shown()
    {
        var (message, reference) = ErrorBoundary.Describe(new ValidationException("Quantity must be greater than 0"), false);
        Assert.Equal("Validation error", message.Title);
        Assert.Contains("greater than 0", message.Text);
        Assert.Null(reference);
    }

    [Fact]
    public void A_bug_is_generic_with_a_reference()
    {
        var (message, reference) = ErrorBoundary.Describe(new InvalidOperationException("SELECT * FROM orders failed"), false);
        Assert.Equal(ErrorBoundary.GenericTitle, message.Title);
        Assert.StartsWith(ErrorBoundary.GenericText, message.Text);
        Assert.DoesNotContain("SELECT", message.Text);
        Assert.NotNull(reference);
        Assert.Equal(12, reference!.Length);
        Assert.EndsWith(reference, message.Text);
    }

    [Fact]
    public void Detailed_mode_shows_the_raw_exception()
    {
        var (message, _) = ErrorBoundary.Describe(new InvalidOperationException("database down"), true);
        Assert.Equal("InvalidOperationException", message.Title);
        Assert.Contains("database down", message.Text);
    }
}
