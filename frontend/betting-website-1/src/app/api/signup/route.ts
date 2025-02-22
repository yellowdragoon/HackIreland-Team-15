import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, passportPhoto } = await request.json();
  console.log(name);
  console.log(passportPhoto);

  const dataToSend = { name, passportPhoto };
  const externalApiResponse = await fetch('https://dbc2-89-101-110-214.ngrok-free.app/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json', // Sending JSON
      'Accept': 'application/json'
    },
    body: JSON.stringify(dataToSend)
  });

  // Parse the JSON response from the external API
  const {user_id, name: externalName, ref_score} = await externalApiResponse.json();

  console.log(user_id, externalName, ref_score);
  
  return NextResponse.json({user_id, externalName, ref_score});
}
