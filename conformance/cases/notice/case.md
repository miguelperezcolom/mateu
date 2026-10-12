# notice

**Pins:** the `Notice` component — the compact themed inline banner — on the wire: a `NoticeDto`/`NoticeMetadata` carrying `text`, the `theme` tint ("warning"), the optional right-aligned action (`actionLabel` + `actionId`, dispatched through the standard action mechanism) and the `slim` tight-variant flag. Declared as a fluent `Notice` in a component-tree view because that is the one shape all three servers share: the declarative `@Notice` String-field marker (which emits the text as a `${state.<field>}` template) is Java-only, with no .NET attribute or Python marker counterpart. Worth pinning because the notice is the standard in-form status strip (used across the front-office demos) and its member names/casing (`actionLabel` vs `action_label`, `slim`) must agree across the three mappers (`NoticeMapper`, `ComponentMapper.cs`, `mapper.py`) for any renderer to tint and wire the action correctly.

## Window title

The view declares a title, so the increment carries a `SetWindowTitle` command although a component tree is no reflected page (no Page wrapper in any of the three servers). Without it the browser tab kept the previous page's title and screen readers heard no navigation. (The envelope divergence this section used to predict was closed in the ports: their allow-lists are empty.)
