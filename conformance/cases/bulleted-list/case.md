# bulleted-list

Pins the declarative bulleted-list idiom: a collection-of-strings field marked @BulletedList / [BulletedList] / BulletedList() travels as an ordinary FormField whose stereotype is "bulletedList", with the items riding in the field's value/state — no separate component, no options list. This is worth pinning because the marker is pure sugar for a stereotype string, and a port that drifts to the fluent BulletedList component (a real ClientSideComponent with an items list) or to the grid path for collections would render something structurally different from the same declaration. It also exposes a real typing gap: Java's FieldTypeMapper gives any Collection field dataType "array", while both ports' data-type inference has no collection branch on the plain-field path and falls through to "string".

## Known divergence

Both ports will diverge on the field's dataType: Java's FieldTypeMapper maps any Collection/array field to dataType "array" (FieldTypeMapper.java, the Collection branch), while .NET's ReflectionMapper.InferDataType and Python's mapper.infer_data_type have no collection branch on the plain-field path and fall through to "string". Stereotype "bulletedList" and the items themselves should agree; the dataType mismatch alone makes the ports xfail against the Java-written golden.
