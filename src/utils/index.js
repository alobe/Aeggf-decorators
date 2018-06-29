'use strict';

require('reflect-metadata');

const R = require('ramda');
R.get = (path, obj) => R.path(path.split('.'), obj);
R.setVal = (path, val, obj) => R.assocPath(path.split('.'), val, obj);

const getSymbols = (...args) => {
  const Symbols = {};
  for (const key of args) {
    Symbols[key] = Symbol(key);
  }
  return Symbols;
};

// 元数据反射相关
const getMetaData = target => metadata => Reflect.getMetadata(metadata, target);
const defMetaData = (key, val, target) => Reflect.defineMetadata(key, val, target);
const hasMetaData = (key, target) => Reflect.hasMetadata(key, target);

module.exports = {
  getSymbols,
  getMetaData,
  defMetaData,
  hasMetaData,
  R
};
