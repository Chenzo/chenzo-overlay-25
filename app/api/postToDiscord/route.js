import { NextResponse } from 'next/server';

const serverAddress = process.env.MURRAY_SERVER;

export async function POST(req) {
  try {
    // Parse the request body
    const body = await req.json();

    console.log('Posting to Discord...');
    console.log(body);

    // Construct the POST request to `${serverAddress}/announceStream`
    const response = await fetch(`${serverAddress}/overlay/annoucestream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Handle the response from the server
    if (!response.ok) {
      const errorDetails = await response.json();
      return NextResponse.json(
        { error: 'Failed to post to Discord', details: errorDetails },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error posting to Discord:', error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
  }
}
