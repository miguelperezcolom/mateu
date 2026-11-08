/**
 * A ButtonGroup placed in CONTENT reaches the wire as a Button whose `children` are the group's
 * buttons and which has no action of its own (the toolbar group's shape — the server's
 * ButtonMapper.mapButtonGroupToDto). It used to render as one button labelled like the group that
 * ran nothing. The members render side by side, each a button of its own.
 *
 * Returns the members of a group, or null when the button is an ordinary one.
 */
export function buttonGroupMembers(metadata: Record<string, unknown>): Record<string, unknown>[] | null {
  const children = metadata['children'];
  if (!Array.isArray(children) || children.length === 0) return null;
  const actionId = metadata['actionId'];
  if (typeof actionId === 'string' && actionId.trim() !== '') return null;
  return children.filter((c): c is Record<string, unknown> => !!c && typeof c === 'object');
}
