import * as bcrypt from 'bcrypt';
import { validate, validationError } from '../../errors';
import * as config from '../../../config';
import { Admin } from '../../entity/Admin';
import { issueUserToken, ensureAdmin } from '../../authentication';
import * as R from 'ramda';

async function authenticateAdmin(admin, password) {
  if (!admin) {
    return false;
  }
  return await bcrypt.compare(password, admin.encryptedPassword);
}

export async function signin(_obj, { username, password }, { db }) {
  const repository = db.getRepository(Admin);
  const admin = await repository.findOne({ username });
  const valid = await authenticateAdmin(admin, password);
  if (!valid) {
    throw validationError({
      errorMsg: '用户名不存在或密码错误!',
    });
  }
  const token = issueUserToken(admin);
  return R.compose(
    R.merge({ jwt: token, privilegesStr: JSON.stringify(admin.privileges) }),
    R.pick(['id', 'username'])
  )(admin);
}

export async function modifyAdminPassword(_obj, data, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  const repository = db.getRepository(Admin);

  data = validate(data, {
    oldPassword: 'required|min:6',
    newPassword: 'required|min:6',
  });

  const valid = await authenticateAdmin(admin, data.oldPassword);
  if (!valid) {
    throw validationError({
      errorMsg: '当前密码错误!',
    });
  }
// Todo admin.encryptedPassword 报错
  admin['encryptedPassword'] = await bcrypt.hash(
    data.newPassword,
    Number(config.SALT_ROUNDS)
  );
  await repository.save(admin);
  return true;
}

export async function addMotherType(_obj, { title, isShow, banner}, { db, jwt }) {

}

export async function modifyMotherType(_obj, { id, title, isShow, banner}, { db, jwt }) {

}

export async function deleteMotherType(_obj, { id}, { db, jwt }) {

}

export async function addChildType(_obj, {title, isShow, motherID}, { db, jwt }) {

}

export async function modifyChildType(_obj, { id, title, isShow, motherID}, { db, jwt }) {

}

export async function deleteChildType(_obj, { id }, { db, jwt }) {

}
