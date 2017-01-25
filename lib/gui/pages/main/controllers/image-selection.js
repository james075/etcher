/*
 * Copyright 2016 resin.io
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

const _ = require('lodash');
const messages = require('../../../../shared/messages');

module.exports = function(
  SupportedFormatsModel,
  SelectionStateModel,
  AnalyticsService,
  ErrorService,
  OSDialogService,
  OSOpenExternalService,
  WarningModalService
) {

  /**
   * @summary Main supported extensions
   * @constant
   * @type {String[]}
   * @public
   */
  this.mainSupportedExtensions = _.intersection([
    'img',
    'iso',
    'zip'
  ], SupportedFormatsModel.getAllExtensions());

  /**
   * @summary Extra supported extensions
   * @constant
   * @type {String[]}
   * @public
   */
  this.extraSupportedExtensions = _.difference(
    SupportedFormatsModel.getAllExtensions(),
    this.mainSupportedExtensions
  ).sort();

  /**
   * @summary Select image
   * @function
   * @public
   *
   * @param {Object} image - image
   *
   * @example
   * OSDialogService.selectImage()
   *   .then(ImageSelectionController.selectImage);
   */
  this.selectImage = (image) => {
    if (!SupportedFormatsModel.isSupportedImage(image.path)) {
      OSDialogService.showError('Invalid image', messages.error.invalidImage({
        image: image
      }));

      AnalyticsService.logEvent('Invalid image', image);
      return;
    }

    if (!SupportedFormatsModel.seemsWindowsImage(image.path)) {
      SelectionStateModel.setImage(image);

      // An easy way so we can quickly identify if we're making use of
      // certain features without printing pages of text to DevTools.
      image.logo = Boolean(image.logo);
      image.bmap = Boolean(image.bmap);

      AnalyticsService.logEvent('Select image', image);

      return;
    }

    AnalyticsService.logEvent('Possibly Windows image', image);

    WarningModalService.display({
      confirmationLabel: 'Continue',
      rejectionLabel: 'See documentation',
      description: messages.warning.possiblyWindowsImage()
    }).then((userAccepted) => {
      if (userAccepted) {
        AnalyticsService.logEvent('User accepted possibly Windows image', image);

        SelectionStateModel.setImage(image);

        // An easy way so we can quickly identify if we're making use of
        // certain features without printing pages of text to DevTools.
        image.logo = Boolean(image.logo);
        image.bmap = Boolean(image.bmap);

        AnalyticsService.logEvent('Select image', image);
      } else {
        AnalyticsService.logEvent('User rejected possibly Windows image', image);
        OSOpenExternalService.open('https://github.com/resin-io/etcher/blob/master/docs/USER-DOCUMENTATION.md#why-is-my-drive-not-bootable');
      }
    });

  };

  /**
   * @summary Open image selector
   * @function
   * @public
   *
   * @example
   * ImageSelectionController.openImageSelector();
   */
  this.openImageSelector = () => {
    OSDialogService.selectImage().then((image) => {

      // Avoid analytics and selection state changes
      // if no file was resolved from the dialog.
      if (!image) {
        return;
      }

      this.selectImage(image);
    }).catch(ErrorService.reportException);
  };

  /**
   * @summary Reselect image
   * @function
   * @public
   *
   * @example
   * ImageSelectionController.reselectImage();
   */
  this.reselectImage = () => {
    this.openImageSelector();
    AnalyticsService.logEvent('Reselect image');
  };

};
