import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { recipient, amount } = await request.json();

  // Process the transfer logic here (e.g., database operations)
  
  return NextResponse.json({ message: `Transfer of $${amount} to ${recipient} was successful.` });
}
