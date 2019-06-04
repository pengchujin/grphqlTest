import { sign, verify } from 'jsonwebtoken';
import * as config from '../config';
import { validationError } from './errors';
import { Admin } from './entity/Admin';

export function issueUserToken(user) {
  return sign({ id: user.id }, config.JWT_SECRET, { expiresIn: '30d' });
}

function extractJwt(jwt) {
  const parts = (jwt || '').split(' ');
  if (parts.length !== 2) {
    return null;
  }
  try {
    return verify(parts[1], config.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export async function fetchAdmin(db, jwt) {
  const jwtObject = extractJwt(jwt);
  if (!(jwtObject && typeof jwtObject === 'object' && jwtObject.id)) {
    return null;
  }
  const repository = db.getRepository(Admin);
  return await repository.findOne({ id: jwtObject.id });
}

export async function ensureAdmin(db, jwt) {
  const admin = await fetchAdmin(db, jwt);
  if (!admin) {
    throw validationError({
      errorMsg: '请先登录!'
    });
  }
  return admin;
}
