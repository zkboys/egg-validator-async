'use strict';

// const Parameter = require('parameter');
const {default: Schema} = require('async-validator');
const asyncValidatorTypes = Object.keys(Schema.validators);

/**
 * 检测类型是否与async-validator或已有类型重复
 * @param {string} type  类型
 * @param {object} rules  类型对应的规则
 */
function checkType(type, rules = {}) {
    const types = Object.keys(rules).concat(asyncValidatorTypes);

    if (types.includes(type)) throw Error(`type: ${type} is already in use!`);
}

class Validator {
    constructor(rules = {}) {
        Object.keys(rules).forEach(type => checkType(type));

        this.rules = rules;
    }

    addRule(type, rule) {
        checkType(type, this.rules);
        this.rules[type] = rule;
    }

    addRules(rules = {}) {
        Object.keys(rules).forEach(type => checkType(type));
        Object.entries(rules).forEach(([key, value]) => {
            this.rules[key] = value;
        });
    }

    async validate(descriptor, data) {
        const validator = new Schema(descriptor);

        await validator.validate(data);
    }
}

module.exports = app => {
    // 可以在app实例上添加属性
    app.validator = new Validator();
};
