import * as React from "react";
// import { db } from "@/db";
// import { studies as studiesTable } from "@/db/schema";

export async function Studies() {
  // const studies = await db.select().from(studiesTable).all();

  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">Some studies here</div>;
}
