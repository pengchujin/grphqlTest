import * as bcrypt from 'bcrypt';
import { validate, validationError } from '../../errors';
import * as config from '../../../config';
import { Admin } from '../../entity/Admin';
import { issueUserToken, ensureAdmin } from '../../authentication';
import * as R from 'ramda';
import { MotherType } from '../../entity/MotherType';
import { ChildType } from '../../entity/ChildType';
import { Pic } from '../../entity/Pic';

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
  console.log(admin);
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
  const admin = await ensureAdmin(db, jwt);
  const motherTypeRepository = db.getRepository(MotherType);
  let newMotherType = {
    title: title,
    isShow: isShow,
    banner: banner
  };
  try {
    await motherTypeRepository.save(newMotherType);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

export async function modifyMotherType(_obj, { id, title, isShow, banner}, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  const motherTypeRepository = db.getRepository(MotherType);
  let oldMotherType = await motherTypeRepository.findOne(id);
  console.log(oldMotherType);
  if (!oldMotherType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  let newMotherType = oldMotherType;
  newMotherType.title = title;
  newMotherType.isShow = isShow;
  newMotherType.banner = banner;
  let res = {};
  try {
    res = await motherTypeRepository.save(newMotherType);
  } catch (err) {
    console.log(err);
    return false;
  }
  // Todo 修改返回
  return res;
}

export async function deleteMotherType(_obj, { id}, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  console.log(admin);
  const motherTypeRepository = db.getRepository(MotherType);
  let oldMotherType = await motherTypeRepository.findOne(id);
  console.log(oldMotherType);
  if (!oldMotherType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  try {
    await motherTypeRepository.remove(oldMotherType);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

export async function addChildType(_obj, {title, isShow, motherID}, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  const motherTypeRepository = db.getRepository(MotherType);
  const childTypeRepository = db.getRepository(ChildType);
  let motherType = await motherTypeRepository.findOne(motherID);
  if (!motherType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  let newChildType = {};
  newChildType['title'] = title;
  newChildType['isShow'] = isShow;
  newChildType['motherType'] = motherType;

  try {
    await childTypeRepository.save(newChildType);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

export async function modifyChildType(_obj, { id, title, isShow, motherID}, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  let res = {};
  const motherTypeRepository = db.getRepository(MotherType);
  const childTypeRepository = db.getRepository(ChildType);
  let oldChildType = await childTypeRepository.findOne(id);
  if (!oldChildType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  console.log(oldChildType);
  let newChildType = oldChildType;
  let motherType = await motherTypeRepository.findOne(motherID);
  if (!motherType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  newChildType['title'] = title;
  newChildType['isShow'] = isShow;
  newChildType['motherType'] = motherType;
  try {
   res = await childTypeRepository.save(newChildType);
  } catch (err) {
    throw validationError({
      errorMsg: `${err}`,
    });
  }
  return res;
}

export async function deleteChildType(_obj, { id }, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  console.log(admin);
  const childTypeRepository = db.getRepository(ChildType);
  let oldChildType = await childTypeRepository.findOne(id);
  console.log(oldChildType);
  if (!oldChildType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  try {
    await childTypeRepository.remove(oldChildType);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

export async function addPic(_obj, { childID, isLong, name, url }, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  const picRepository = db.getRepository(Pic);
  const childTypeRepository = db.getRepository(ChildType);
  let oldChildType = await childTypeRepository.findOne(childID);
  console.log(oldChildType);
  if (!oldChildType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  let newPic = {
    childType: oldChildType,
    isLong: isLong,
    name: name,
    url: url
  };

  try {
    await picRepository.save(newPic);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

export async function modifyPic(_obj, { id, childID, isLong, name, url }, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  let res = {};
  const picRepository = db.getRepository(Pic);
  const childTypeRepository = db.getRepository(ChildType);
  let oldChildType = await childTypeRepository.findOne(childID);
  console.log(oldChildType);
  if (!oldChildType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  let oldPic = await picRepository.findOne(id);
  if (!oldPic) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  let newPic = oldPic;
  newPic['childType'] = oldChildType;
  newPic['isLong'] = isLong;
  newPic['name'] = name;
  newPic['url'] = url;
  try {
   res = await picRepository.save(newPic);
  } catch (err) {
    console.log(err);
    return false;
  }
  return res;
}

export async function deletePic(_obj, { id }, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  const picRepository = db.getRepository(Pic);
  let oldPic = await picRepository.findOne(id);
  if (!oldPic) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  try {
     await picRepository.remove(oldPic);
   } catch (err) {
     console.log(err);
     return false;
   }
  return true;
}
