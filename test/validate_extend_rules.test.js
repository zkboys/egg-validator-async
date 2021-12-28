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

        it('should return invalid_param', () => {
            return app.httpRequest()
                .post('/users.json')
                .send({
                    mobile: 123,
                    mobile2: 123,
                    mobile3: 123,
                    user: {
                        name: '张三',
                        mobile: 123,
                        mobile2: 123,
                        age: '12',
                    },
                })
                .type('json')
                .expect(500)
                .expect(res => {
                    assert(res.body.name === 'Error');
                    assert(res.body.message === 'Async Validation Error');
                    assert.deepEqual(res.body.errors, [
                        { field: 'mobile', message: '请输入正确的手机号！', fieldValue: '123' },
                        { field: 'mobile2', message: '手机号错误！', fieldValue: '123' },
                        { field: 'mobile3', message: '请输入正确的手机号！', fieldValue: '123' },
                        { field: 'name', message: 'name is required' },
                        { field: 'phone', message: '手机号不允许为空！' },
                        { field: 'user.mobile', message: '请输入正确的手机号！', fieldValue: 123 },
                        { field: 'user.mobile2', message: '请输入正确的手机号！', fieldValue: 123 },
                        { field: 'user.age', message: '年龄必填！', fieldValue: '12' },
                    ]);
                    assert.deepEqual(res.body.fields, {
                        mobile: [{ message: '请输入正确的手机号！', field: 'mobile', fieldValue: '123' }],
                        mobile2: [{ message: '手机号错误！', field: 'mobile2', fieldValue: '123' }],
                        mobile3: [{ message: '请输入正确的手机号！', field: 'mobile3', fieldValue: '123' }],
                        name: [{ message: 'name is required', field: 'name' }],
                        phone: [{ message: '手机号不允许为空！', field: 'phone' }],

                        'user.mobile': [
                            {
                                message: '请输入正确的手机号！',
                                fieldValue: 123,
                                field: 'user.mobile',
                            },
                        ],
                        'user.mobile2': [
                            {
                                message: '请输入正确的手机号！',
                                fieldValue: 123,
                                field: 'user.mobile2',
                            },
                        ],
                        'user.age': [
                            {
                                message: '年龄必填！',
                                fieldValue: '12',
                                field: 'user.age',
                            },
                        ],
                    });
                });
        });

        it('should all pass', () => {
            return app.httpRequest()
                .post('/users.json')
                .send({
                    mobile: 18611436666,
                    mobile2: 18611436666,
                    mobile3: 18611436666,
                    name: 123,
                    phone: 123,
                    user: {
                        name: '张三',
                        mobile: '18611436666',
                        mobile2: '18611436666',
                        mobileNumber: 18611436666,
                        age: 12,
                    },
                })
                .type('json')
                .expect(200);
        });
    });
});
