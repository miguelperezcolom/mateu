/**
 * Copyright (c) 2020, 2024 Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 */
  define(['knockout',
  'ojs/ojkeyset',
  'ojs/ojarraytreedataprovider',
  'text!resources/config/menu.json'
  ], function (ko, keySet, ArrayTreeDataProvider, navigationMenuAsText) {
  'use strict';

  var navigationMenu = JSON.parse(navigationMenuAsText);
  
  var PageModule = function PageModule(context) {
    
  };
  
  PageModule.prototype.getExpandedMenu = function() {
    return new keySet.AllKeySetImpl();
  };

    PageModule.prototype.getNavigationContent = function () {
      if (this.navigationContent === undefined) {
        this.navigationContent = ko.observable(new ArrayTreeDataProvider(
          this._getNavigationData(
            navigationMenu), {
          keyAttributes: 'attr.id'
        }));
      }
      return this.navigationContent;
    };

    PageModule.prototype._getNavigationData = function (menu) {
      var navData = [],
      self = this;
      for (var i = 0; i < menu.length; i++) {
        var menuItem = {};
        var origMenuItem = menu[i];
        if (typeof origMenuItem === "object") {
          menuItem["attr"] = {
            "id": origMenuItem.id,
            "name": origMenuItem.label,
            "icon": origMenuItem.icon,
            "badge": origMenuItem.badge,
            "badgeType": origMenuItem.badgeType
          };
        }
        if (origMenuItem.items && origMenuItem.items.length > 0)
          menuItem["children"] = this._getNavigationData(origMenuItem.items);
        navData.push(menuItem);
      }
      return navData;
    };

  PageModule.prototype.itemSelectable = function (context) {
    return context['leaf'];
  }; 

  return PageModule;
});