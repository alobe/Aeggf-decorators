'use strict';

const {
  PATH_MD,
  METHOD_MD,
  MESSAGE_MD,
  BEFORE_MD,
  AFTER_MD,
  IGNORE_JWT_MD
} = require('../constants/route-metadata');
const ReqMethod = require('../constants/request-method');
const { getSymbols, getMetaData, defMetaData, hasMetaData } = require('../utils');

const _def = defMetaData;

const {
  gainMappingDecorator,
  gainSingleDecorator,
  gainArrayDecorator,
  mappingRequest
} = getSymbols([ 'gainMappingDecorator', 'gainSingleDecorator', 'gainArrayDecorator', 'mappingRequest' ]);

module.exports = class MethodOper {

  constructor (map) {
    this.map = map;
  }

  getMetaData (target) {
    const _get = getMetaData(target);
    return {
      reqMethod: _get(METHOD_MD),
      path: _get(PATH_MD),
      before: _get(BEFORE_MD) || [],
      after: _get(AFTER_MD) || [],
      message: _get(MESSAGE_MD),
      ignoreJwt: _get(IGNORE_JWT_MD)
    };
  }

  get () {
    return this[gainMappingDecorator](ReqMethod.Get);
  }

  post () {
    return this[gainMappingDecorator](ReqMethod.Post);
  }

  put () {
    return this[gainMappingDecorator](ReqMethod.Put);
  }

  delete () {
    return this[gainMappingDecorator](ReqMethod.Delete);
  }

  patch () {
    return this[gainMappingDecorator](ReqMethod.Patch);
  }

  options () {
    return this[gainMappingDecorator](ReqMethod.Options);
  }

  head () {
    return this[gainMappingDecorator](ReqMethod.Head);
  }

  message () {
    return this[gainSingleDecorator](MESSAGE_MD);
  }

  ignoreJwt () {
    return this[gainSingleDecorator](IGNORE_JWT_MD);
  }

  before () {
    return this[gainArrayDecorator](BEFORE_MD);
  }

  after () {
    return this[gainArrayDecorator](AFTER_MD);
  }

  [gainMappingDecorator] (method) {
    return path => this[mappingRequest]({
      [PATH_MD]: path,
      [METHOD_MD]: method
    });
  }

  [mappingRequest] (request_metadata = { [PATH_MD]: '/', [METHOD_MD]: ReqMethod.Get }) {

    return (target, key, descriptor) => {
      this.map.set(target, target);
      for (const key in request_metadata) {
        _def(key, request_metadata[key], descriptor.value);
      }
      return descriptor;
    };
  }

  [gainSingleDecorator] (metadatakey) {
    return metadatvalue =>
      (target, key, desciptor) => {
        this.map(target, target);
        _def(metadatakey, metadatvalue, desciptor.value);
        return desciptor;
      };
  }

  [gainArrayDecorator] (metadatakey) {
    return metadatavalues =>
      (target, key, descriptor) => {
        metadatavalues = metadatavalues instanceof Array ? metadatavalues : [ metadatavalues ];
        if (hasMetaData(metadatakey, descriptor.value)) {
          const old_metadatavalues = getMetaData(descriptor.value)(metadatakey) || [];
          metadatavalues = metadatavalues.concat(old_metadatavalues);
        }
        _def(metadatakey, metadatavalues, descriptor.value);
        return descriptor;
      };
  }
};
