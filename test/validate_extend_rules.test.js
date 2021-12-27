'use strict';

const mm = require('egg-mock');
const assert = require('assert');

describe('test/validate.test.js', () => {
  let app;
  before(() => {
    app = mm.app({
      baseDir: 'validate_form_extend_rules',
    });
    return app.ready();
  });

  after(() => app.close());

  describe('post', () => {
    it('should all pass', () => {
      return app.httpRequest()
        .post('/users.json')
        .send({
          mobile: 123,
          mobile2: 123,
        })
        .type('json')
        .expect(500)
        .expect(res => {
          assert(res.body.name === 'Error');
          assert(res.body.message === 'Async Validation Error');
          assert.deepEqual(res.body.errors, [
            { field: 'mobile', message: '请输入正确的手机号！', fieldValue: '123' },
            { field: 'mobile2', message: '手机号错误！', fieldValue: '123' },
          ]);
          assert.deepEqual(res.body.fields, {
            mobile: [{ message: '请输入正确的手机号！', field: 'mobile', fieldValue: '123' }],
            mobile2: [{ message: '手机号错误！', field: 'mobile2', fieldValue: '123' }],
          });
        });
    });
  });
});
