package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.collections.*;
import io.mateu.uidl.core.annotations.MenuOption;

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
