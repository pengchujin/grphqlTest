import * as fs from 'fs';
import * as path from 'path';
import { makeExecutableSchema } from 'graphql-tools';
import { resolvers } from './admin/resolvers';

const schemaPath = path.join(
  __filename,
  '..',
  '..',
  'api',
  'admin.graphql'
);
const typeDefs = fs.readFileSync(schemaPath, 'utf8');

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
