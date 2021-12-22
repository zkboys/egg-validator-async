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

    // NaN
    // eslint-disable-next-line no-self-compare
    if (!result && result !== result) throw Error(`${value} can not convert to ${type}!`);

    return result;
};

const convertMap = {
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

            data = data || this.request.body;

            // 处理简写方式
            descriptor = Object.entries(descriptor).reduce((prev, curr) => {
                const [field, rule] = curr;
                let rules = rule;

                if (typeof rule === 'string') {
                    let type = rule;
                    let required;

                    if (rule.endsWith('?')) {
                        required = false;
                        type = rule.replace('?', '');
                    } else {
                        required = true;
                    }

                    rules = asyncValidatorTypes.includes(type) ? [{type, required}] : [{required}, {type}];
                }
                return {
                    ...prev,
                    [field]: rules,
                };
            }, {});


            // 基于type进行类型转换，只转换对象第一层属性
            if (typeof data === 'object') {
                // 进行浅拷贝，防止修改原始对象
                // data = { ...data };
                Object.entries(descriptor).forEach(([key, rule]) => {
                    const rules = Array.isArray(rule) ? rule : [rule];
                    const record = rules.find(item => !!item.type);
                    const type = record ? record.type : 'string';
                    const parser = convertMap[type];
                    const value = data[key];

                    const convertRecord = rules.find(item => item.convert !== undefined);
                    const _convert = convertRecord ? convertRecord.convert : convert;

                    if (_convert && value !== undefined && parser) data[key] = parser(value);
                });
            }

            // 处理用户自定义规则
            const customerRules = this.app.validator.rules || {};

            Object.entries(descriptor).forEach(([field, rule]) => {
                const rules = Array.isArray(rule) ? rule : [rule];
                descriptor[field] = rules;
                rules.forEach(item => {
                    const {type} = item;
                    const customerRule = customerRules[type];
                    if (customerRule) {
                        item.message = item.message || customerRule.message;
                        item.type = customerRule.type || 'string';

                        Object.entries(customerRule)
                            .forEach(([k, v]) => {
                                if (['message', 'type'].includes(k)) return;
                                item[k] = v;
                            });
                    }
                });
            });

            // console.log(descriptor);

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
