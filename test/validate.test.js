'use strict';

const mm = require('egg-mock');
const assert = require('assert');

describe('test/validate.test.js', () => {
    let app;
    before(() => {
        app = mm.app({
            baseDir: 'validate_form',
        });
        return app.ready();
    });

    after(() => app.close());

    describe('get', () => {
        it('should return invalid_param when body empty', () => {
            return app.httpRequest()
                .get('/users.json')
                .type('json')
                .expect(500)
                .expect(res => {
                    assert(res.body.name === 'Error');
                    assert(res.body.message === 'Async Validation Error');
                    assert.deepEqual(res.body.errors, [
                        {field: 'username', message: 'username is required'},
                        {field: 'password', message: 'password is required'},
                    ]);
                    assert.deepEqual(res.body.fields, {
                        username: [{message: 'username is required', field: 'username'}],
                        password: [{message: 'password is required', field: 'password'}],
                    });
                });
        });

        it('should all pass', () => {
            return app.httpRequest()
                .get('/users.json')
                .send({
                    username: 'foo@gmail.com',
                    password: '123456',
                })
                .expect({
                    username: 'foo@gmail.com',
                    password: '123456',
                })
                .expect(200);
        });

    });

    describe('post', () => {
        it('should return invalid_param when body empty', () => {
            return app.httpRequest()
                .post('/users.json')
                .expect(500)
                .expect(res => {
                    assert(res.body.name === 'Error');
                    assert(res.body.message === 'Async Validation Error');
                    assert.deepEqual(res.body.errors, [
                        {field: 'username', message: 'username is required'},
                        {field: 'password', message: 'password is required'},
                    ]);
                    assert.deepEqual(res.body.fields, {
                        username: [{message: 'username is required', field: 'username'}],
                        password: [{message: 'password is required', field: 'password'}],
                    });
                });
        });

        it('should return invalid_param when length invaild', () => {
            return app.httpRequest()
                .post('/users.json')
                .send({
                    username: 'foo',
                    password: '12345',
                })
                .expect(500)
                .expect(res => {
                    assert(res.body.name === 'Error');
                    assert(res.body.message === 'Async Validation Error');

                    assert.deepEqual(res.body.errors, [
                        {message: 'username is not a valid email', fieldValue: 'foo', field: 'username'},
                    ]);
                });
        });

        it('should return invalid_param when username invaild', () => {
            return app.httpRequest()
                .post('/users.json')
                .send({
                    username: '.foo@gmail.com',
                    password: '123456',
                })
                .expect(500)
                .expect(res => {
                    assert(res.body.name === 'Error');
                    assert(res.body.message === 'Async Validation Error');

                    assert.deepEqual(res.body.errors, [
                        {message: 'username is not a valid email', fieldValue: '.foo@gmail.com', field: 'username'},
                    ]);
                });
        });

        it('should all pass', () => {
            return app.httpRequest()
                .post('/users.json')
                .send({
                    username: 'foo@gmail.com',
                    password: '123456',
                })
                .expect({
                    username: 'foo@gmail.com',
                    password: '123456',
                })
                .expect(200);
        });
    });
});
