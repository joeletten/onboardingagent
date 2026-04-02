export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return Response.json(
      { error: 'ANTHROPIC_API_KEY is not set. Add it to .env.local and restart.' },
      { status: 500 }
    )
  }

  try {
    const body = await request.json()

    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    const data = await upstream.json()
    return Response.json(data, { status: upstream.status })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
