import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      message:
        'Checkout sessions are created by the Express backend via POST /api/customer/bookings.',
    },
    { status: 410 }
  )
}
