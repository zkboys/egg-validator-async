'use strict';
const Schema = require('async-validator').default;

const convertMap = {
  string: String,
  number: Number,
  boolean: Boolean,
  // method: Must be of type function.
  regexp: value => new RegExp(value),
  integer: parseInt,
  float: parseFloat,
  // array: Must be an array as determined by Array.isArray.
  // object: Must be of type object and not Array.isArray.
  // enum: Value must exist in the enum.
  // date: Value must be valid as determined by Date
  // url: Must be of type url.
  // hex: Must be of type hex.
  // email: Must be of type email.
  // any: Can be any type.
};

module.exports = {
  /**
   * validate data with rules
   *
   * @param  {Object} descriptor  - validate rule object, see [async-validator](https://github.com/yiminghe/async-validator)
   * @param  {Object} [data] - validate target, default to `this.request.body`
   * @param  {Object} [options] - validate options
   */
  async validate(descriptor, data, options) {
    let convert = (options || {}).convert;

    if (convert === undefined) convert = this.app.config.validate.convert;

    data = data || this.request.body;

    // 基于type进行类型转换，只转换对象第一层属性
    if (convert && typeof data === 'object') {
      Object.entries(descriptor).forEach(([key, rule]) => {
        const rules = Array.isArray(rule) ? rule : [rule];
        const record = rules.find(item => !!item.type);
        const type = record ? record.type : 'string';
        const parser = convertMap[type];
        const value = data[key];

        if (value !== undefined && parser) data[key] = parser(value);
      });
    }

    const validator = new Schema(descriptor);

    await validator.validate(data);

    return data;
  },
};
