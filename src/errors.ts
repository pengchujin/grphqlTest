import { GraphQLError } from 'graphql';
import * as Validator from 'validatorjs';

Validator.useLang('zh');
const ATTRIBUTE_NAMES = {
  cellphone: '手机号',
  password: '密码'
};

export function validationError(errors) {
  return new GraphQLError(
    '无法处理请求!',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    { errorFields: errors }
  );
}

export function validate(data, rules) {
  const validator = new Validator(data, rules);
  validator.setAttributeNames(ATTRIBUTE_NAMES);
  if (validator.fails()) {
    throw validationError(validator.errors.all());
  }
  return data;
}
