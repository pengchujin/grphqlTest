import * as bcrypt from 'bcrypt';
import { validate, validationError } from '../../errors';
import * as config from '../../../config';
import { Admin } from '../../entity/Admin';
import { issueUserToken, ensureAdmin } from '../../authentication';
import * as R from 'ramda';
import { MotherType } from '../../entity/MotherType';
import { ChildType } from '../../entity/ChildType';
import { Pic } from '../../entity/Pic';

export async function getTypeList(_obj, { id }, { db }) {
  let res = [];
  console.log(db, id);
  const motherTypeRepository = db.getRepository(MotherType);
  if ( id === -1 ) {
    res = await motherTypeRepository.find();
    console.log(res);
  } else {
    let type = await motherTypeRepository.findOne(id);
    res.push(type);
  }
  console.log(res);
  return res;
}

export async function getChildPics(_obj, { childID, languageType }, { db }) {
  const childRespository = db.getRepository(ChildType);
  let res = await childRespository.findOne(childID);
  let pics = [];
  for (let x of res.pics) {
    if (x.languageType === 0 || x.languageType === languageType) {
      pics.push(x);
     }
  }
  pics.sort(function(a, b) {
    return a.childList - b.childList;
  });
  return res;
}

export async function getMotherPics(_obj, { motherID, languageType }, { db }) {
  const motherRespository = db.getRepository(MotherType);
  let res = await motherRespository.findOne(motherID);
  let pics = [];
  for (let i of res.childTypes) {
    let id = i.id;
    for (let x of i.pics) {
     if (x.languageType === 0 || x.languageType === languageType) {
       x['childID'] = id;
      pics.push(x);
     }
    }
  }
  pics.sort(function(a, b) {
    return a.motherList - b.motherList;
  });
  res['pics'] = pics;
  return res;
}
