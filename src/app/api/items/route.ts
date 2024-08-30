import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function GET() {
    const db = await openDb();
    const items = await db.all('SELECT * FROM items')
    return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
    const db = await openDb();
    // update the request data structure
    const { name, description } = await request.json();
    const result = await db.run('INSERT INTO items (name, description) VALUES (?, ?)', [name, description]);
    // const item = await db.get('SELECT * FROM items WHERE id = ?', [result.lastID]);
    // return NextResponse.json(item);
    return NextResponse.json({ id: result.lastID }, { status: 201 });
}