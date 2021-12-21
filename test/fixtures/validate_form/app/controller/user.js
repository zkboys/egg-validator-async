'use strict';

const createRule = {
    username: {
        type: 'email',
        required: true,
    },
    password: {
        type: 'string',
        required: true,
    },
};

exports.create = async function() {
    await this.validate(createRule);
    this.body = this.request.body;
};
