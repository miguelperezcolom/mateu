/**
 * Clean-room Redwood Spectra renderer entry.
 *
 * Registers the native root element `<rw-root>`, which pulls in the render tree + every Spectra
 * template. There is NO shared Vaadin renderer and NO mateu-ui here: only the protocol client and
 * the wire DTOs are reused from libs/mateu (both Vaadin-free). See src/rw/ for the host loop.
 */
import '@/rw/rw-root'
