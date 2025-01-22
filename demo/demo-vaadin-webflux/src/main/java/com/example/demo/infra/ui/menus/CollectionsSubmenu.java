package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.components.forms.fields.collections.ArraysForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.CollectionsForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.EditableCustomFormTableForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.EditableTableForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.EnumsCollectionsForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.ExternalRefsCollectionsForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.FilterableTableForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.ObjectsForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.RefsForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.TablesForm;
import com.example.demo.infra.ui.menus.components.forms.fields.collections.WithValuesProvidersCollectionsForm;
import io.mateu.uidl.annotations.MenuOption;

public class CollectionsSubmenu {

  @MenuOption private ArraysForm arrays;

  @MenuOption private CollectionsForm collections;

  @MenuOption private EnumsCollectionsForm enumsCollections;

  @MenuOption private ExternalRefsCollectionsForm externalRefsCollections;

  @MenuOption private WithValuesProvidersCollectionsForm withValuesProvidersCollections;

  @MenuOption private ObjectsForm objects;

  @MenuOption private RefsForm refsCollections;

  @MenuOption private TablesForm tables;

  @MenuOption private FilterableTableForm filterableTables;

  @MenuOption private EditableTableForm editableTables;

  @MenuOption private EditableCustomFormTableForm editableTablesWithCustomForm;
  /*

  @MenuOption private SimpleMapsForm simpleMaps;

  @MenuOption private ComplexMapsForm complexMaps;

   */
}
