import * as bcrypt from 'bcrypt';
import { validate, validationError } from '../../errors';
import * as config from '../../../config';
import { Admin } from '../../entity/Admin';
import { issueUserToken, ensureAdmin } from '../../authentication';
import * as R from 'ramda';
import { MotherType } from '../../entity/MotherType';
import { ChildType } from '../../entity/ChildType';
import { Pic } from '../../entity/Pic';
import { BrandPic } from '../../entity/BrandPic';
import { Vip } from '../../entity/vip';

export async function getTypeList(_obj, { id }, { db }) {
  let res = [];
  const motherTypeRepository = db.getRepository(MotherType);
  if (id === -1) {
    res = await motherTypeRepository.find({ order: {id: 'ASC'} });
    for (let i of res) {
      i.childTypes.sort((a, b) => a.sort - b.sort);
    }
  } else {
    let type = await motherTypeRepository.findOne(id);
    res.push(type);
  }
  return res;
}

export async function getChildPics(_obj, { childID, languageType }, { db }) {
  const childRespository = db.getRepository(ChildType);
  let res = await childRespository.findOne(childID);
  let pics = {
    enPics: [],
    cnPics: [],
    allPics: []
  };
  for (let x of res.pics) {
    pics.allPics.push(x);
    if (x.languageType === 0 || x.languageType === 2) {
      pics.enPics.push(x);
    }
    if (x.languageType === 0 || x.languageType === 1) {
      pics.cnPics.push(x);
    }
  }
  pics.enPics.sort(function (a, b) {
    return a.childList - b.childList;
  });
  pics.cnPics.sort(function (a, b) {
    return a.childList - b.childList;
  });
  pics.allPics.sort(function (a, b) {
    return a.childList - b.childList;
  });
  res['pics'] = pics;
  return res;
}

export async function getMotherPics(_obj, { motherID, languageType }, { db }) {
  const motherRespository = db.getRepository(MotherType);
  let res = await motherRespository.findOne(motherID);
  let pics = {
    enPics: [],
    cnPics: [],
    allPics: []
  };
  for (let i of res.childTypes) {
    let id = i.id;
    for (let x of i.pics) {
      pics.allPics.push(x);
      if (x.languageType === 0 || x.languageType === 2) {
        x['childID'] = id;
        pics.enPics.push(x);
      }
      if (x.languageType === 0 || x.languageType === 1) {
        x['childID'] = id;
        pics.cnPics.push(x);
      }
    }
  }
  pics.cnPics.sort(function (a, b) {
    return a.motherList - b.motherList;
  });
  pics.enPics.sort(function (a, b) {
    return a.motherList - b.motherList;
  });
  pics.allPics.sort(function (a, b) {
    return a.motherList - b.motherList;
  });
  res['pics'] = pics;
  return res;
}

export async function getBrandPics(_obj, {}, { db }) {
  const brandPicRespository = db.getRepository(BrandPic);
  let  resPics = await brandPicRespository.find({ order: {order: 'ASC'} });
  let pics = {
    enPics: [],
    cnPics: [],
    allPics: []
  };
  for (let x of resPics) {
    pics.allPics.push(x);
    if (x.languageType === 0 || x.languageType === 2) {
      pics.enPics.push(x);
    }
    if (x.languageType === 0 || x.languageType === 1) {
      pics.cnPics.push(x);
    }
  }
  return pics;
}

export async function getAllUsers(_obj, {}, { db }) {
  const vipRespository = db.getRepository(Vip);
  const users = await vipRespository.find({order: {id: 'ASC'}});
  return users;
}
