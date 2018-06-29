'use strict';

const {
  CTRL_PREFIX_MD,
  CTRL_BEFOREALL_MD,
  CTRL_AFTERALL_MD,
  CTRL_IGNORE_JWTALL_MD
} = require('../constants/route-metadata');
const { getSymbols, getMetaData, defMetaData, hasMetaData } = require('../utils');

const _def = defMetaData;

const {
  gainArrayDecorator,
  gainSingleDecorator
} = getSymbols([ 'gainArrayDecorator', 'gainArrayDecorator' ]);

module.exports = class ControllerOper {

  getMetaData (target) {
    const _get = getMetaData(target);
    return {
      beforeAll: _get(CTRL_BEFOREALL_MD) || [],
      afterAll: _get(CTRL_AFTERALL_MD) || [],
      prefix: _get(CTRL_PREFIX_MD),
      ignoreJwtAll: _get(CTRL_IGNORE_JWTALL_MD)
    };
  }

  [gainSingleDecorator] (metadatakey) {
    return metadatavalue => target => _def(metadatakey, metadatavalue, target);
  }

  [gainArrayDecorator] (metadatakey) {
    return metadatavalues =>
      target => {
        metadatavalues = metadatavalues instanceof Array ? metadatavalues : [ metadatavalues ];
        if (hasMetaData(metadatakey, target)) {
          const old_metadatavalues = getMetaData(metadatakey, target);
          metadatavalues = metadatavalues.concat(old_metadatavalues);
        }
        _def(metadatakey, metadatavalues, target);
      };
  }

  beforeAll () {
    return this[gainArrayDecorator](CTRL_BEFOREALL_MD);
  }

  afterAll () {
    return this[gainArrayDecorator](CTRL_AFTERALL_MD);
  }

  prefix () {
    return this[gainSingleDecorator](CTRL_PREFIX_MD);
  }

  ignoreJwtAll () {
    return this[gainSingleDecorator](CTRL_IGNORE_JWTALL_MD);
  }
};
