namespace Mateu.Uidl;

/// <summary>An error whose message is MEANT for the user (mirrors Java's
/// <c>io.mateu.uidl.UserFacingException</c>): throw it from an action and its message is shown in the
/// error toast as written, with its optional title. Every other exception is treated as a bug: the
/// user sees a generic "Something went wrong" with a reference id and the exception is logged at
/// error level under that id. Set the <c>MATEU_ERRORS_DETAILED=true</c> environment variable in
/// development to see the raw exception in the toast.</summary>
public class UserFacingException : Exception
{
    /// <summary>The toast's title; null for the default ("Error").</summary>
    public string? Title { get; }

    public UserFacingException(string message) : base(message) { }

    public UserFacingException(string? title, string message) : base(message) => Title = title;

    public UserFacingException(string? title, string message, Exception? inner) : base(message, inner) => Title = title;
}
