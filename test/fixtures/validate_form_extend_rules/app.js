'use strict';


module.exports = function(app) {
  app.validator.addRules({
    mobile: {
      pattern: /^\d{11}$/,
      message: '请输入正确的手机号！',
    },
  });
};
