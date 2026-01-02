import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function askQuestion(
  question: string,
  chunks: { text: string }[]
) {
  const context = chunks.map(c => c.text).join('\n\n')

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful codebase assistant.'
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion:\n${question}`
      }
    ]
  })

  return response.choices[0].message.content
}
