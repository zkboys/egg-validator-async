'use strict';

const createRule = {
  mobile: {
    type: 'mobile',
    required: true,
  },
  mobile2: {
    type: 'mobile',
    required: true,
    message: '手机号错误！',
  },
  mobile3: 'mobile',
  name: 'string',
  job: 'string?',
};

exports.create = async function() {
  await this.validate(createRule);

  this.body = this.request.body;
};
