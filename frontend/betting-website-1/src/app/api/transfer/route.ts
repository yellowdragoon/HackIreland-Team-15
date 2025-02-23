import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, passport_string, amount } = await request.json();
  console.log(name);
  console.log(passport_string);
  console.log(process.env.NEXT_PUBLIC_SERVER_URL + 'api/v1/users/');

  const dataToSend = { name, passport_string };
  const externalApiResponse = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + 'api/v1/users/' + passport_string, {
    method: 'GET',
    headers: {
      // 'Content-Type': 'application/json', // Sending JSON
      'Accept': 'application/json'
    },
    // body: JSON.stringify(dataToSend)
  });

  // Parse the JSON response from the external API
  const {name: externalName, ref_score} = await externalApiResponse.json();

  console.log(externalName, ref_score);
  
  return NextResponse.json({externalName, ref_score});
}
