using System.Runtime.CompilerServices;

// The code-authoring types moved to the Mateu.Uidl assembly in 3.0-alpha.412 (same full names), so a
// UI-only module can implement them without referencing Mateu.Core. These forwarders keep binaries
// compiled against Mateu.Core's copy loading.
[assembly: TypeForwardedTo(typeof(Mateu.Core.RouteEntry))]
[assembly: TypeForwardedTo(typeof(Mateu.Core.IRouteEntrySupplier))]
[assembly: TypeForwardedTo(typeof(Mateu.Core.IMenuSupplier))]
[assembly: TypeForwardedTo(typeof(Mateu.Core.IAppSupplier))]
[assembly: TypeForwardedTo(typeof(Mateu.Core.AppShell))]
