import { Client, query as q } from 'faunadb';
import { User, TreeRequest } from '../types';
import {
  FAUNADB_SECRET,
  USERS_COLLECTION,
  USERS_INDEX
} from '../config';

const db = new Client( { secret: FAUNADB_SECRET });

export const fetchUser = async (req: TreeRequest): Promise<User> => {
  const ref = q.Match(q.Index(USERS_INDEX), req.userId);
  try {
    const userExists = await db.query(
      q.Exists(ref)
    );

    let user: User;
    if (userExists) {
      const result = await db.query(q.Get(ref)) as { data: User };

      user = result.data;
    } else {
      user = {
        userId: req.userId,
      };
    }

    return user;
  } catch (err) {
    throw err;
  }
};

export const saveUser = async (user: User): Promise<User> => {
  try {
    const result = await db.query(
      q.Let(
        { res: q.Paginate(q.Match(q.Index(USERS_INDEX), user.userId), { size: 1 }) },
        q.If(
          q.Equals(q.Count(q.Select(['data'], q.Var('res'))), 1),
          q.Replace(q.Select(['data', 0], q.Var('res')), { data: user }),
          q.Create(q.Collection(USERS_COLLECTION), { data: user })
        )
      )
    ) as { data: User };
    return result.data;
  } catch (err) {
    throw err;
  }
};
