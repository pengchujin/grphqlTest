import * as bcrypt from 'bcrypt';
import { validate, validationError } from '../../errors';
import * as config from '../../../config';
import { Admin } from '../../entity/Admin';
import { issueUserToken, ensureAdmin, ensureVip } from '../../authentication';
import * as R from 'ramda';
import * as Bluebird from 'bluebird';
import { MotherType } from '../../entity/MotherType';
import { ChildType } from '../../entity/ChildType';
import { Pic } from '../../entity/Pic';
import { BrandPic } from '../../entity/BrandPic';
import { Vip } from '../../entity/vip';
import { Collection } from '../../entity/Collection';

async function authenticateAdmin(admin, password) {
  if (!admin) {
    return false;
  }
  return await bcrypt.compare(password, admin.encryptedPassword);
}

async function authenticateVip(vip, password) {
  if (!vip) {
    return false;
  }
  return await bcrypt.compare(password, vip.encryptedPassword);
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

export async function vipSignin(_obj, { username, password }, { db }) {
  const repository = db.getRepository(Vip);
  const vip = await repository.findOne({ username });
  const valid = await authenticateAdmin(vip, password);
  if (!valid) {
    throw validationError({
      errorMsg: '用户名不存在或密码错误!',
    });
  }
  const token = issueUserToken(vip);
  return R.compose(
    R.merge({ jwt: token, privilegesStr: JSON.stringify(vip.privileges) }),
    R.pick(['id', 'username'])
  )(vip);
}

export async function addVip(_obj, { username, password }, { db, jwt }) {
  const adminLogin = await ensureAdmin(db, jwt);
  const repository = db.getRepository(Vip);
  const encryptedPassword = await bcrypt.hash(password, Number(config.SALT_ROUNDS));
  const admin = repository.create({
    username,
    encryptedPassword
  });
  await repository.save(admin);
  return true;
}

export async function deleteVip(_obj, { id }, { db, jwt }) {
  const adminLogin = await ensureAdmin(db, jwt);
  const repository = db.getRepository(Vip);
  const collectionRepository = db.getRepository(Collection);
  const vip = await repository.findOne(id);
  if (!vip) {
    throw validationError({
      errorMsg: '没有当前用户',
    });
  }
  await collectionRepository.remove(vip.collections);
  await repository.remove(vip);
  return true;
}

export async function modifyAdminPassword(_obj, {data}, { db, jwt }) {
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

export async function modifyVipPassword(_obj, {vipId, newPassword}, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  const repository = db.getRepository(Vip);
  const vip = await repository.findOne(vipId);
  vip['encryptedPassword'] = await bcrypt.hash(
    newPassword,
    Number(config.SALT_ROUNDS)
  );
  await repository.save(vip);
  return true;
}

export async function addCollection(_obj, {collection}, { db, jwt }) {
  const vip = await ensureVip(db, jwt);
  const collectionRepository = db.getRepository(Collection);
  const newCollection = await collectionRepository.create(collection);
  newCollection.vip = vip;
  await collectionRepository.save(newCollection);
  return true;
}

export async function addMotherType(_obj, { title, enTitle, isShow, banner, enBanner}, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  const motherTypeRepository = db.getRepository(MotherType);
  let newMotherType = {
    enTitle: enTitle,
    title: title,
    isShow: isShow,
    banner: banner,
    enBanner: enBanner
  };
  try {
    await motherTypeRepository.save(newMotherType);
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
}

export async function modifyMotherType(_obj, { id, title, enTitle, isShow, banner, enBanner}, { db, jwt }) {
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
  newMotherType.enTitle = enTitle;
  newMotherType.isShow = isShow;
  newMotherType.banner = banner;
  newMotherType.enBanner = enBanner;
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

export async function addChildType(_obj, {title, enTitle, isShow, motherID}, { db, jwt }) {
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
  newChildType['enTitle'] = enTitle;
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

export async function modifyChildType(_obj, { id, title, enTitle, isShow, motherID}, { db, jwt }) {
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
  newChildType['enTitle'] = enTitle;
  newChildType['isShow'] = isShow;
  newChildType['motherType'] = motherType;
  try {
   res = await childTypeRepository.save(newChildType);
  } catch (err) {
    throw validationError({
      errorMsg: `${err}`,
    });
  }
  return motherType;
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

export async function addPic(_obj, { pics }, { db, jwt }) {
  // childID, isLong, name, url, languageType, motherList, childList, ifShow
  const admin = await ensureAdmin(db, jwt);
  const picRepository = db.getRepository(Pic);
  const childTypeRepository = db.getRepository(ChildType);
  let res = [];
  await Bluebird.map(pics, async (pic) => {
    let oldChildType = await childTypeRepository.findOne(pic.childID);
  console.log(oldChildType);
  if (!oldChildType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  let newPic = {
    childType: oldChildType,
    isLong: pic.isLong,
    name: pic.name,
    url: pic.url,
    languageType: pic.languageType,
    motherList: pic.motherList,
    childList: pic.childList,
    ifShow: pic.ifShow
  };

  try {
   let pic = await picRepository.save(newPic);
   res.push(pic);
  } catch (err) {
    console.log(err);
    throw validationError({
      errorMsg: `${err}`,
    });
  }
  });
  return res;
}

export async function modifyPic(_obj, { pics }, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  let resArray = [];
  const picRepository = db.getRepository(Pic);
  const childTypeRepository = db.getRepository(ChildType);
  await Bluebird.map(pics, async (pic) => {
  let oldChildType = await childTypeRepository.findOne(pic.childID);
  if (!oldChildType) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  let oldPic = await picRepository.findOne(pic.id);
  if (!oldPic) {
    throw validationError({
      errorMsg: '请求ID错误，没有此类型!',
    });
  }
  let newPic = oldPic;
  newPic['childType'] = oldChildType;
  newPic['isLong'] = pic.isLong;
  newPic['languageType'] = pic.languageType;
  newPic['name'] = pic.name;
  newPic['url'] =  pic.url;
  newPic['childList'] =  pic.childList;
  newPic['motherList'] =  pic.motherList;
  newPic['ifShow'] =  pic.ifShow;
  try {
   let res = await picRepository.save(newPic);
   resArray.push(res);
  } catch (err) {
    console.log(err);
    throw validationError({
      errorMsg: `${err}`,
    });
  }
  });
  return resArray;
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

export async function addBrandPic(_obj, { pics }, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  const picRepository = db.getRepository(BrandPic);
  pics = JSON.parse(JSON.stringify(pics));
  let res = [];
  await Bluebird.map(pics, async (pic) => {
    try {
      let picRes = await picRepository.save(pic);
      res.push(picRes);
    } catch (err) {
      throw validationError({
        errorMsg: `${err}`,
      });
    }
  });
  return res;
}

export async function modifyBrandPic(_obj, { pics }, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  pics = JSON.parse(JSON.stringify(pics));
  const picRepository = db.getRepository(BrandPic);
  let res = [];
  await Bluebird.map(pics, async (pic) => {
    try {
      await picRepository.update(pic.id, pic);
      let picRes = await picRepository.findOne(Number(pic.id));
      res.push(picRes);
    } catch (err) {
      throw validationError({
        errorMsg: `${err}`,
      });
    }
  });
  return res;
}

export async function deleteBrandPic(_obj, { id }, { db, jwt }) {
  const admin = await ensureAdmin(db, jwt);
  const picRepository = db.getRepository(BrandPic);
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
