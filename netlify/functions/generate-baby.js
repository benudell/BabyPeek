exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY
  const replicateToken = process.env.REPLICATE_API_TOKEN

  if (!anthropicKey || !replicateToken) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'API keys not configured on server' }),
    }
  }

  let parsed
  try {
    parsed = JSON.parse(event.body)
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON body' }) }
  }

  const { action, body, predictionId } = parsed

  if (action === 'generate-prompt') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return { statusCode: res.status, headers, body: JSON.stringify(data) }
  }

  if (action === 'create-prediction') {
    const res = await fetch(
      'https://api.replicate.com/v1/models/black-forest-labs/flux-1.1-pro/predictions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${replicateToken}`,
        },
        body: JSON.stringify(body),
      }
    )
    const data = await res.json()
    return { statusCode: res.status, headers, body: JSON.stringify(data) }
  }

  if (action === 'poll-prediction') {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Bearer ${replicateToken}` },
    })
    const data = await res.json()
    return { statusCode: res.status, headers, body: JSON.stringify(data) }
  }

  return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid action' }) }
}
