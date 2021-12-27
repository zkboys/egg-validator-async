'use strict';
const Schema = require('async-validator').default;
const asyncValidatorTypes = Object.keys(Schema.validators);

/**
 * 转换为number，如果转为NaN会报错
 * @param {string} type 要转成的类型
 * @return {(function(*=): (number))|*} 返回转换函数
 */
const toNumber = type => value => {
  if (typeof value === 'number') return value;

  if (!value) return value;

  const result = Number(value);

  if (isNaN(result)) throw Error(`${value} can not convert to ${type}!`);

  return result;
};

const CONVERT_MAP = {
  string: String,
  number: toNumber('number'),
  boolean: value => {
    if (typeof value === 'boolean') return value;

    if (['false', 'null', '0', 'undefined', 'NaN'].includes(value)) return false;

    return Boolean(value);
  },
  // method: Must be of type function.
  regexp: value => new RegExp(value),
  integer: toNumber('integer'),
  float: toNumber('float'),
  // array: Must be an array as determined by Array.isArray.
  // object: Must be of type object and not Array.isArray.
  // enum: Value must exist in the enum.
  // date: Value must be valid as determined by Date
  // url: Must be of type url.
  // hex: Must be of type hex.
  // email: Must be of type email.
  // any: Can be any type.
};

/**
 * 基于type进行类型转换，只转换对象第一层属性，副作用：改变原对象
 * @param {object} descriptor 校验规则
 * @param {object} data 需要校验的数据
 * @param {boolean} convert 是否进行转换
 */
function convertObject(descriptor, data, convert) {
  // 基于type进行类型转换，只转换对象第一层属性
  if (typeof data === 'object') {
    // data = { ...data }; // 进行浅拷贝，防止修改原始对象
    Object.entries(descriptor).forEach(([key, rule]) => {
      const rules = Array.isArray(rule) ? rule : [rule];
      const record = rules.find(item => !!item.type);
      const type = record ? record.type : 'string';
      const parser = CONVERT_MAP[type];
      const value = data[key];

      const convertRecord = rules.find(item => item.convert !== undefined);
      const _convert = convertRecord ? convertRecord.convert : convert;

      if (_convert && value !== undefined && parser) data[key] = parser(value);
    });
  }

  return data;
}

/**
 * 处理用户扩展类型
 * @param {object} userExtendRules 用户扩展类型
 * @param {object} descriptor 检验规则
 */
function extendRules(userExtendRules, descriptor) {
  // 不存在用户扩展规则，不处理
  if (!userExtendRules) return;

  Object.entries(descriptor).forEach(([field, rule]) => {
    const rules = Array.isArray(rule) ? rule : [rule];
    descriptor[field] = rules;
    rules.forEach(item => {
      const { type, fields } = item;
      const extendRule = userExtendRules[type];

      if (extendRule) {
        item.message = item.message || extendRule.message;
        item.type = extendRule.type || 'string';

        Object.entries(extendRule)
          .forEach(([k, v]) => {
            if (['message', 'type'].includes(k)) return;
            item[k] = v;
          });
      }

      // 深层处理
      if (fields) {
        extendRules(userExtendRules, fields);
      }
    });
  });
}

/**
 * 处理简写方式  name: 'string?'
 * @param {object} descriptor 校验规则
 */
function simpleType(descriptor) {
  // 处理简写方式
  Object.entries(descriptor).forEach(([field, rules]) => {
    if (typeof rules === 'string') {
      let type = rules;
      let required;

      if (rules.endsWith('?')) {
        required = false;
        type = rules.replace('?', '');
      } else {
        required = true;
      }

      descriptor[field] = asyncValidatorTypes.includes(type) ? [{ type, required }] : [{ required }, { type }];
    }

    descriptor[field] = Array.isArray(rules) ? rules : [rules];

    descriptor[field].forEach(rule => {
      const { fields } = rule;

      // 深层处理
      if (fields) {
        simpleType(fields);
      }
    });
  });
}

module.exports = {
  /**
   * validate data with rules
   *
   * @param  {Object} descriptor  - validate rule object, see [async-validator](https://github.com/yiminghe/async-validator)
   * @param  {Object} [data] - validate target, default to `this.request.body`
   * @param  {Object} [options] - validate options
   */
  async validate(descriptor, data, options) {
    try {
      let convert = (options || {}).convert;

      if (convert === undefined) convert = this.app.config.validate.convert;

      // 默认校验body
      data = data || this.request.body;

      // 处理简写方式
      simpleType(descriptor);

      // 处理用户扩展规则
      extendRules(this.app.validator.rules, descriptor);

      // 数据类型转换
      convertObject(descriptor, data, convert);

      const validator = new Schema(descriptor);

      await validator.validate(data);

      // 校验成功之后，返回数据
      return data;
    } catch (error) {
      // 标记校验的数据源
      // ctx.headers ctx.params ctx.query ctx.request.body
      if (data === this.headers) error.dataSource = 'headers';
      if (data === this.params) error.dataSource = 'params';
      if (data === this.query) error.dataSource = 'query';
      if (data === this.request.body) error.dataSource = 'body';

      throw error;
    }
  },
};
