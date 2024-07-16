package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.collections.*;
import io.mateu.mdd.shared.annotations.MenuOption;

public class CollectionsSubmenu {

  @MenuOption private ArraysForm arrays;

  @MenuOption private CollectionsForm collections;

  @MenuOption private EnumsCollectionsForm enumsCollections;

  @MenuOption private ExternalRefsCollectionsForm externalRefsCollections;

  @MenuOption private WithValuesProvidersCollectionsForm withValuesProvidersCollections;

  @MenuOption private ObjectsForm objects;

  @MenuOption private ComplexCollectionsForm complexCollections;

  /*

  @MenuOption private SimpleMapsForm simpleMaps;

  @MenuOption private ComplexMapsForm complexMaps;

   */
}
