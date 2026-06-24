import { db } from './index.ts';
import { users, userSettings } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string) {
  const result = await db.insert(users)
    .values({
      uid,
      email,
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email,
      },
    })
    .returning();

  const user = result[0];
  
  // Create default settings if not exists
  await db.insert(userSettings)
    .values({
      userId: user.id,
    })
    .onConflictDoNothing();

  return user;
}
