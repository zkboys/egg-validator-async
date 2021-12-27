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
  user: {
    type: 'object',
    required: true,
    message: '用户必填！',
    fields: {
      name: 'string',
      mobile: 'mobile?',
      mobile2: [
        { type: 'mobile2' },
      ],
      mobileNumber: [
        { type: 'mobile' },
        {
          type: 'number',
        },
      ],
      age: [
        { type: 'number', required: true, message: '年龄必填！' },
      ],
    },
  },
};

exports.create = async function() {
  await this.validate(createRule);

  this.body = this.request.body;
};
