import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, departmentId, date, time, reason } = body;

    const appointment = {
      id: `NIV-${Math.floor(100000 + Math.random() * 900000)}`,
      name: name || "Anonymous Provider",
      phone: phone || "Not provided",
      departmentId: departmentId || "general",
      date: date || new Date().toISOString().split("T")[0],
      time: time || "10:00 AM",
      reason: reason || "RCM Consultation Request",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to book appointment" }, { status: 500 });
  }
}
