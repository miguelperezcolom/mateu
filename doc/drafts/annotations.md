Mateu MDD looks at annotations to know how to show your model.

There are three groups of annotations supported:

- Mateu MDD propietary annotations
- javax-validation annotations
- JPA annotations

# Propietary annotations list


<table>
  <tr><th>Annotation</th><th>Description</th></tr>

  <tr><td colspan="2"><h4>UI</h4></td></tr>
  <tr><td><code language="java"><b>@MateuUI</b></code></td><td>___</td></tr>
  <tr><td><code language="java"><b>@Area</b></code></td><td>___</td></tr>
  <tr><td><code language="java"><b>@Submenu</b></code></td><td>___</td></tr>
  <tr><td><code language="java"><b>@MenuOption</b></code></td><td>___</td></tr>
  <tr><td><code language="java"><b>@Action</b></code></td><td>___</td></tr>

  <tr><td colspan="2"><h4>Field filtering</h4></td></tr>
  <tr><td><code language="java">@Columns</code></td><td>___</td></tr>
  <tr><td><code language="java">@EditableFields</code></td><td>___</td></tr>
  <tr><td><code language="java">@FilterFields</code></td><td>___</td></tr>

  <tr><td colspan="2"><h4>Behavior</h4></td></tr>
  <tr><td><pre><code language="java"><b>@VisibleIf("$this.age > 18")</b>
String creditCadNumber;</code></pre></td><td>___</td></tr>
  <tr><td><code language="java">@Balance</code></td><td>___</td></tr>
  <tr><td><code language="java">@Caption</code></td><td>___</td></tr>
  <tr><td><code language="java">@CellStyleGenerator</code></td><td>___</td></tr>
  <tr><td><code language="java">@Code</code></td><td>___</td></tr>
  <tr><td><code language="java">@ColumnWidth</code></td><td>___</td></tr>
  <tr><td><code language="java">@Css</code></td><td>___</td></tr>
  <tr><td><code language="java">@DataProvider</code></td><td>___</td></tr>
  <tr><td><code language="java">@DependsOn</code></td><td>___</td></tr>
  <tr><td><code language="java">@EnabledIf</code></td><td>___</td></tr>
  <tr><td><code language="java">@EndTabs</code></td><td>___</td></tr>
  <tr><td><code language="java">@ExpandOnOpen</code></td><td>___</td></tr>
  <tr><td><code language="java">@FieldGroup</code></td><td>___</td></tr>
  <tr><td><code language="java">@Forbidden</code></td><td>___</td></tr>
  <tr><td><code language="java">@FrozenColumn</code></td><td>___</td></tr>
  <tr><td><code language="java">@FullWidth</code></td><td>___</td></tr>
  <tr><td><code language="java">@GenericClass</code></td><td>___</td></tr>
  <tr><td><code language="java">@Height</code></td><td>___</td></tr>
  <tr><td><code language="java">@Help</code></td><td>___</td></tr>
  <tr><td><code language="java">@Home</code></td><td>___</td></tr>
  <tr><td><code language="java">@Html</code></td><td>___</td></tr>
  <tr><td><code language="java">@HtmlCol</code></td><td>___</td></tr>
  <tr><td><code language="java">@IFrame</code></td><td>___</td></tr>
  <tr><td><code language="java">@Ignored</code></td><td>___</td></tr>
  <tr><td><code language="java">@Indelible</code></td><td>___</td></tr>
  <tr><td><code language="java">@Keep</code></td><td>___</td></tr>
  <tr><td><code language="java">@KPI</code></td><td>___</td></tr>
  <tr><td><code language="java">@KPIInline</code></td><td>___</td></tr>
  <tr><td><code language="java">@ListColumn</code></td><td>___</td></tr>
  <tr><td><code language="java">@ListeralSearchFilter</code></td><td>___</td></tr>
  <tr><td><code language="java">@MainSearchFilter</code></td><td>___</td></tr>
  <tr><td><code language="java">@ModifyValuesOnly</code></td><td>___</td></tr>
  <tr><td><code language="java">@Money</code></td><td>___</td></tr>
  <tr><td><code language="java">@NativeJPQLResult</code></td><td>___</td></tr>
  <tr><td><code language="java">@NewNotAllowed</code></td><td>___</td></tr>
  <tr><td><code language="java">@NoChart</code></td><td>___</td></tr>
  <tr><td><code language="java">@NonDuplicable</code></td><td>___</td></tr>
  <tr><td><code language="java">@NotInEditor</code></td><td>___</td></tr>
  <tr><td><code language="java">@NotInlineEditable</code></td><td>___</td></tr>
  <tr><td><code language="java">@NotInList</code></td><td>___</td></tr>
  <tr><td><code language="java">@NotWhenCreating</code></td><td>___</td></tr>
  <tr><td><code language="java">@NotWhenEditing</code></td><td>___</td></tr>
  <tr><td><code language="java">@Order</code></td><td>___</td></tr>
  <tr><td><code language="java">@Output</code></td><td>___</td></tr>
  <tr><td><code language="java">@Password</code></td><td>___</td></tr>
  <tr><td><code language="java">@Pdf</code></td><td>___</td></tr>
  <tr><td><code language="java">@Position</code></td><td>___</td></tr>
  <tr><td><code language="java">@PrivateHome</code></td><td>___</td></tr>
  <tr><td><code language="java">@PublicHome</code></td><td>___</td></tr>
  <tr><td><code language="java">@QLFilter</code></td><td>___</td></tr>
  <tr><td><code language="java">@QLForCombo</code></td><td>___</td></tr>
  <tr><td><code language="java">@ReadOnly</code></td><td>___</td></tr>
  <tr><td><code language="java">@ReadWrite</code></td><td>___</td></tr>
  <tr><td><code language="java">@RegistrationForm</code></td><td>___</td></tr>
  <tr><td><code language="java">@RightAlignedCol</code></td><td>___</td></tr>
  <tr><td><code language="java">@SameLine</code></td><td>___</td></tr>
  <tr><td><code language="java">@SearchFilter</code></td><td>___</td></tr>
  <tr><td><code language="java">@Section</code></td><td>___</td></tr>
  <tr><td><code language="java">@SectionKPI</code></td><td>___</td></tr>
  <tr><td><code language="java">@Signature</code></td><td>___</td></tr>
  <tr><td><code language="java">@StartTabs</code></td><td>___</td></tr>
  <tr><td><code language="java">@Stylist</code></td><td>___</td></tr>
  <tr><td><code language="java">@Submenu</code></td><td>___</td></tr>
  <tr><td><code language="java">@Sum</code></td><td>___</td></tr>
  <tr><td><code language="java">@Tab</code></td><td>___</td></tr>
  <tr><td><code language="java">@TextArea</code></td><td>___</td></tr>
  <tr><td><code language="java">@unmodifiable</code></td><td>___</td></tr>
  <tr><td><code language="java">@UseChips</code></td><td>___</td></tr>
  <tr><td><code language="java">@UseComponentsToEditValues</code></td><td>___</td></tr>
  <tr><td><code language="java">@UseIdToSelect</code></td><td>___</td></tr>
  <tr><td><code language="java">@UseLinkToListView</code></td><td>___</td></tr>
  <tr><td><code language="java">@UseRadioButtons</code></td><td>___</td></tr>
  <tr><td><code language="java">@UseTable</code></td><td>___</td></tr>
  <tr><td><code language="java">@UseTwinCols</code></td><td>___</td></tr>
  <tr><td><code language="java">@ValueClass</code></td><td>___</td></tr>
  <tr><td><code language="java">@ValueQL</code></td><td>___</td></tr>
  <tr><td><code language="java">@WeekDays</code></td><td>___</td></tr>
  <tr><td><code language="java">@Width</code></td><td>___</td></tr>
  <tr><td><code language="java">@Wizard</code></td><td>___</td></tr>


  <tr><td colspan="2"><h4>App</h4></td></tr>
  <tr><td><code language="java"><b>@AppListener</b></code></td><td>___</td></tr>
  <tr><td><code language="java"><b>@BoundaryListener</b></code></td><td>___</td></tr>
</table>


# Validation supported annotations

Mateu MDD adds the hibernate-validator dependency so the javax-validation api is supported.

The `@NotNull` and `@NotEmpty` annotations are specially treated by Mateu MDD as they make a required indicator visible for these fields.

# JPA supported annotations

`@ManyToOne`, `@OneToMany`, `@ManyToMany` relationships are handled in an special way by Mateu MDD. So, `@ManyToOne` fields are shown as a combobox, and `@OneToMany` and `@ManyToMany` fields are shown as a grid.




***

Continue with the manual at [supported properties list](Supported-properties-list).