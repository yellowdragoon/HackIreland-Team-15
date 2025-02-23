import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const breachData = await request.json();
  console.log(process.env.NEXT_PUBLIC_SERVER_URL + 'api/v1/breach-events/');

  const externalApiResponse = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + 'api/v1/breach-events/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(breachData)
  });

  const {user_id, name: externalName, ref_score} = await externalApiResponse.json();

  console.log(user_id, externalName, ref_score);
  
  return NextResponse.json({user_id, externalName, ref_score});
}