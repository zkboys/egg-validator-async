# egg-validator-async

[![NPM version][npm-image]][npm-url]
[![Test coverage][codecov-image]][codecov-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-validator-async.svg?style=flat-square

[npm-url]: https://npmjs.org/package/egg-validator-async

[codecov-image]: https://img.shields.io/codecov/c/github/zkboys/egg-validator-async.svg?style=flat-square

[codecov-url]: https://codecov.io/github/zkboys/egg-validator-async?branch=master

[snyk-image]: https://snyk.io/test/npm/egg-validator-async/badge.svg?style=flat-square

[snyk-url]: https://snyk.io/test/npm/egg-validator-async

[download-image]: https://img.shields.io/npm/dm/egg-validator-async.svg?style=flat-square

[download-url]: https://npmjs.org/package/egg-validator-async

基于 [async-validator](https://github.com/yiminghe/async-validator) 提供数据校验方法。

## 安装

```bash
$ npm i egg-validator-async --save
```

## 配置

```js
// config/plugin.js
exports.validate = {
    enable: true,
    package: 'egg-validator-async',
};
```

egg-validator-async 支持 async-validator 的所有配置项，查看 [async-validator 文档](https://github.com/yiminghe/async-validator) 获取配置项的更多信息。

```js
// config/config.default.js
exports.validate = {
    // convert: false,
};
```

## 使用方法

- `await ctx.validate(descriptor[, data])` data默认 ctx.request.body
