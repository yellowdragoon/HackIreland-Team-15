import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, passport_string } = await request.json();
  console.log(name);
  console.log(passport_string);
  console.log(process.env.NEXT_PUBLIC_SERVER_URL + 'api/v1/users/');

  const dataToSend = { name, passport_string };
  const externalApiResponse = await fetch(process.env.NEXT_PUBLIC_SERVER_URL + 'api/v1/users/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(dataToSend)
  });

  const {'data': {_id}, name: externalName, ref_score} = await externalApiResponse.json();

  console.log(_id, externalName, ref_score);
  
  return NextResponse.json({_id, externalName, ref_score});
}
