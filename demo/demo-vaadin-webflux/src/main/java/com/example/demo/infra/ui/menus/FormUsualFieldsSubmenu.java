package com.example.demo.infra.ui.menus;

import com.example.demo.infra.ui.menus.forms.*;
import io.mateu.core.domain.uidefinitionlanguage.shared.annotations.MenuOption;

public class FormUsualFieldsSubmenu {

  @MenuOption
  BasicFieldsForm basicFields;
  @MenuOption private TextFieldsForm text;

  @MenuOption private VaadinRichTextFieldForm richTextUsingVaadin;

  @MenuOption private NumberFieldsForm numbers;

  @MenuOption private BooleanFieldsForm checks;

  @MenuOption private DatesFieldsForm dates;

  @MenuOption private PatternValidatedFieldForm pattern;

  @MenuOption private TelephoneFieldForm telephone;

  @MenuOption private EnumFieldsForm enums;

  @MenuOption private NestedDropdownsForm nestedDropdowns;

  @MenuOption private WrappersFieldsForm wrappers;

  @MenuOption private UrlAndTextForm urls;

  @MenuOption IconForm icons;

  @MenuOption ImageForm images = new ImageForm(
          "https://www.svgrepo.com/show/530409/time.svg",
          "https://www.svgrepo.com/show/530464/insurance.svg",
          "https://www.svgrepo.com/show/430013/education-school-study-sticker-9.svg",
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgRnJlZSA2LjQuMiBieSBAZm9udGF3ZXNvbWUgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbSBMaWNlbnNlIC0gaHR0cHM6Ly9mb250YXdlc29tZS5jb20vbGljZW5zZS9mcmVlIChJY29uczogQ0MgQlkgNC4wLCBGb250czogU0lMIE9GTCAxLjEsIENvZGU6IE1JVCBMaWNlbnNlKSBDb3B5cmlnaHQgMjAyMyBGb250aWNvbnMsIEluYy4gLS0+PHBhdGggZD0iTTgwIDEwNGEyNCAyNCAwIDEgMCAwLTQ4IDI0IDI0IDAgMSAwIDAgNDh6bTgwLTI0YzAgMzIuOC0xOS43IDYxLTQ4IDczLjN2ODcuOGMxOC44LTEwLjkgNDAuNy0xNy4xIDY0LTE3LjFoOTZjMzUuMyAwIDY0LTI4LjcgNjQtNjR2LTYuN0MzMDcuNyAxNDEgMjg4IDExMi44IDI4OCA4MGMwLTQ0LjIgMzUuOC04MCA4MC04MHM4MCAzNS44IDgwIDgwYzAgMzIuOC0xOS43IDYxLTQ4IDczLjNWMTYwYzAgNzAuNy01Ny4zIDEyOC0xMjggMTI4SDE3NmMtMzUuMyAwLTY0IDI4LjctNjQgNjR2Ni43YzI4LjMgMTIuMyA0OCA0MC41IDQ4IDczLjNjMCA0NC4yLTM1LjggODAtODAgODBzLTgwLTM1LjgtODAtODBjMC0zMi44IDE5LjctNjEgNDgtNzMuM1YzNTIgMTUzLjNDMTkuNyAxNDEgMCAxMTIuOCAwIDgwQzAgMzUuOCAzNS44IDAgODAgMHM4MCAzNS44IDgwIDgwem0yMzIgMGEyNCAyNCAwIDEgMCAtNDggMCAyNCAyNCAwIDEgMCA0OCAwek04MCA0NTZhMjQgMjQgMCAxIDAgMC00OCAyNCAyNCAwIDEgMCAwIDQ4eiIvPjwvc3ZnPg==",
          ""
  );

}
