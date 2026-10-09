import { db } from "./src/server/db";
import { blocks } from "./src/server/db/schema";
import { sql } from "drizzle-orm";

async function run() {
  const pageId = "123";
  const orderedIds = ["3e7a0505-1a35-430c-80ed-4fb1bb2df697"];
  
  const cases = orderedIds.map((id, index) => {
    return sql`WHEN id = ${id} THEN (${1024 * (index + 1)})::integer`;
  });

  const query = sql`
    UPDATE ${blocks}
    SET position = CASE
      ${sql.join(cases, sql` `)}
      ELSE position
      END,
      updated_at = ${new Date()}
    WHERE page_id = ${pageId}
  `;

  try {
    await db.execute(query);
    console.log("Success");
  } catch (err) {
    console.error("DB Error:", err);
  }
}

run();
