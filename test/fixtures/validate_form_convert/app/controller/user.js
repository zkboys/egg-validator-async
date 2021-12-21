'use strict';

const createRule = {
    username: {
        type: 'string',
        required: true,
    },
    age: {
        type: 'number',
        required: true,
    },
};

exports.create = async function() {
    await this.validate(createRule);

    this.body = this.request.body;
};
