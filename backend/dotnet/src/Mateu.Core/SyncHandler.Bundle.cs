namespace Mateu.Core;

/// <summary>What the static-bundle exporter (<see cref="Bundle.BundleExporter"/>) reads off the
/// handler it renders through: the same catalogues the served app uses, so a bundle ships exactly
/// what the server would answer.</summary>
internal sealed partial class SyncHandler
{
    internal MateuRegistry BundleRegistry => registry;
    internal RouteRegistry BundleRoutes => _routes;
    internal RestSourceRegistry BundleRestSources => _restSources;
    internal ActionRegistry BundleActionCatalog => _actionCatalog;
    internal TranslationRegistry BundleTranslations => _translations;
    internal FieldTypeRegistry BundleFieldTypes => _fieldTypes;
}
