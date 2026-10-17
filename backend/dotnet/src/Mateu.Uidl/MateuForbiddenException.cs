// Lives in the Mateu.Uidl assembly next to UserFacingException (since 3.0-alpha.426), so a UI-only
// module that references just Mateu.Uidl can throw it; the full name is unchanged (Mateu.Core) and
// Mateu.Core forwards it, so binaries compiled against Mateu.Core's copy keep loading.
namespace Mateu.Core;

/// <summary>Thrown when a request asks for something the caller may not do: an action gated by
/// [DisabledUnless]/[EyesOnly] the caller does not satisfy, or a view hidden by a
/// class-level [EyesOnly]. The ASP.NET Core endpoint answers it with HTTP 403.</summary>
public sealed class MateuForbiddenException(string message) : Exception(message);
