import type { Core } from "@strapi/strapi";
import { docs, todayStr } from "./library";

/** All circulation writers lock the patron before copies or loan items. */
export async function lockDocument(strapi: Core.Strapi, uid: string, documentId: string, trx: any) {
  const metadata = strapi.db.metadata.get(uid as any);
  const column = (metadata.attributes.documentId as any)?.columnName ?? "document_id";
  const query = strapi.db.connection(metadata.tableName).where(column, documentId).transacting(trx);
  const client = String((strapi.db.connection as any).client.config.client);
  if (!client.includes("sqlite")) query.forUpdate();
  await query;
}

/** Serialize allocation through insert within the caller's transaction on PostgreSQL. */
export async function circulationCode(strapi: Core.Strapi, uid: string, letters: string, trx: any) {
  const client = String((strapi.db.connection as any).client.config.client);
  if (["pg", "postgres", "postgresql"].includes(client)) {
    await strapi.db.connection.raw("SELECT pg_advisory_xact_lock(hashtext(?))", [`library-code:${uid}`]).transacting(trx);
  }
  const prefix = `${letters}-${todayStr().replace(/-/g, "")}-`;
  let sequence = await docs(strapi, uid).count({ filters: { code: { $startsWith: prefix } } }) + 1;
  let code = `${prefix}${String(sequence).padStart(4, "0")}`;
  // A previous deletion must not make the next count collide with an existing code.
  while (await docs(strapi, uid).count({ filters: { code: { $eq: code } } })) {
    code = `${prefix}${String(++sequence).padStart(4, "0")}`;
  }
  return code;
}
