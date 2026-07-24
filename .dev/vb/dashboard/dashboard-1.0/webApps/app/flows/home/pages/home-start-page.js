/**
 * Copyright (c) 2020, 2024 Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 */
  define(['knockout',
  'ojs/ojresponsiveknockoututils',
  'ojs/ojresponsiveutils',
  "ojs/ojanimation"
  ], function (ko, ResponsiveKnockoutUtils, ResponsiveUtils, AnimationUtils) {
  'use strict';

  var PageModule = function PageModule() {
    this.customMediaQuery = ResponsiveKnockoutUtils.createMediaQueryObservable('(min-width: 1024px) and (max-width: 1200px)');
  };

  PageModule.prototype.getCustomMediaQuery = function () {
    return this.customMediaQuery();
  };

  PageModule.prototype.animate = function (selector, open, delay) {
    const el = document.querySelector(selector);
    el.style.transitionDelay = delay;
    if (open) {
      el.classList.remove("fold-closed");
    }
    else {
      el.classList.add("fold-closed");
    }
  };

  PageModule.prototype.fadeIn = function () {
      // DELAYING the fadeIn to workaround VBS-15851:
      setTimeout(() => {
        this._fadeIn(); 
        }, 100);
  };

  PageModule.prototype._fadeIn = function () {
    var e = document.getElementById("employee-card-right");
    AnimationUtils.flipIn(e, {"duration" : "2s", "persist" : "all", "timingFunction": "ease"});
    e.style.opacity = 1;
    e = document.getElementById("employee-card-left");
    AnimationUtils.flipIn(e, {"duration" : "2s", "startAngle" : "180deg", "endAngle" : "0deg", "persist" : "all", "timingFunction": "ease"});
    e.style.opacity = 1;
    e = document.getElementById("employee-card-main");
    AnimationUtils.fadeIn(e, {"duration" : "1500ms", "delay" : "700ms", "persist" : "all", "timingFunction": "ease"});
  };

  PageModule.prototype.toggle = function () {
    const rootElement = document.querySelector(".fold-panel1");
    const parentElement = document.querySelector(".fold-panels-parent");
    if (rootElement.classList.contains("fold-closed")) {
      parentElement.classList.remove("fold-panels-parent-closed");
      var self = this;
      var show = function () {
        self.animate(".fold-panel1", true, "0ms");
        self.animate(".fold-panel2", true, "217ms");
        self.animate(".fold-panel3", true, "467ms");
        self.animate(".fold-panel4", true, "700ms");
      };
      setTimeout(() => {
        // wait for animation of "fold-panels-parent-closed" to be finished
        // and then unfold action panels:
        show(); 
        }, 300);
    }
    else {
      this.animate(".fold-panel4", false, "0ms");
      this.animate(".fold-panel3", false, "217ms");
      this.animate(".fold-panel2", false, "467ms");
      this.animate(".fold-panel1", false, "700ms");
      setTimeout(() => { 
        // wait for action panels to get folded and then
        // hide the top bar using "fold-panels-parent-closed" animation
        parentElement.classList.add("fold-panels-parent-closed");
        }, 700);

    }
  };

  return PageModule;
});
