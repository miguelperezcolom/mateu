/**
  Copyright (c) 2015, 2025, Oracle and/or its affiliates.
  Licensed under The Universal Permissive License (UPL), Version 1.0
  as shown at https://oss.oracle.com/licenses/upl/

*/
'use strict';

module.exports = function (configObj) {
  return new Promise((resolve) => {
    console.log('Running after_component_create hook.');
    // const componentPath = configObj.componentPath;
    resolve(configObj);
  });
};
