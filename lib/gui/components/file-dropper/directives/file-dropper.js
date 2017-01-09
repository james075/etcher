/*
 * Copyright 2017 resin.io
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * @summary File-dropper directive
 * @function
 * @public
 *
 * @description
 * This directive provides an easy way to drop files into Etcher.
 *
 * @param {Object} $timeout - Angular timeout object.
 * @returns {Object}
 *
 * @example
 * <file-dropper></file-dropper>
 */
module.exports = ($timeout) => {
  return {
    templateUrl: './components/file-dropper/templates/file-dropper.tpl.html',
    replace: false,
    restrict: 'E',
    transclude: true,
    controller: 'FileDropperController as dropper',
    scope: {
      hasOverlay: '=',
      icon: '@',
      text: '@',
      onDrop: '&'
    },
    link: (scope, element) => {
      let hoverLayer = 0;
      const dropper = scope.dropper;

      scope.yank = (file) => {
        $timeout(() => {
          scope.onDrop({
            $file: file
          });
        });
      };

      element[0].ondragover = (event) => {
        event.preventDefault();
        if (dropper.statePageIs('main')) {
          $timeout(() => {
            dropper.isHoverState = true;
          });
        }
      };

      element[0].ondragend = (event) => {
        event.preventDefault();
        $timeout(() => {
          dropper.isHoverState = false;
        });
      };

      element[0].ondragleave = (event) => {
        event.preventDefault();
        hoverLayer -= 1;

        if (hoverLayer === 0) {
          $timeout(() => {
            dropper.isHoverState = false;
          });
        }
      };

      element[0].ondragenter = (event) => {
        event.preventDefault();
        if (dropper.statePageIs('main')) {
          hoverLayer += 1;
        }
      };

      element[0].ondrop = () => {
        dropper.isHoverState = false;
        hoverLayer = 0;
      };
    }
  };
};
