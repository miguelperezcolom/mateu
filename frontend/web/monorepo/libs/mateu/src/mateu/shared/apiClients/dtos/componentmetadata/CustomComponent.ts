import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

/**
 * A genuinely NEW component type the platform does not ship (coherence-plan #14): the per-renderer
 * escape hatch. `name` is the type a renderer registers against (see `registerCustomComponent`) and
 * `props` is the bag it reads; the slotted children ride on the ClientSideComponent's `children`.
 * Where no renderer is registered for `name`, it degrades to the <mateu-unsupported> placeholder.
 */
export default interface CustomComponent extends ComponentMetadata {
    name: string
    props?: Record<string, unknown>
}
