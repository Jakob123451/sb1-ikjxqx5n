const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function sendChatMessage(messages: ChatMessage[]): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1000,
        temperature: 0.7,
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Sorry, I could not process your request.'
  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return 'Sorry, I encountered an error while processing your request.'
  }
}

export function createCoachSystemPrompt(userProfile: any, recentJournals: any[], habits: any[]): string {
  return `You are Xenoxy Coach, an AI life coach specializing in habit formation, purpose discovery, and personal accountability. 

User Profile:
- Level: ${userProfile.level}
- Total XP: ${userProfile.totalXp}
- Current Purpose: ${userProfile.currentPurpose || 'Not yet discovered'}

Active Habits: ${habits.map(h => `${h.name} (${h.xpReward} XP)`).join(', ')}

Recent Journal Insights: ${recentJournals.map(j => j.aiInsights).filter(Boolean).join(' ')}

Your role is to:
1. Help users discover and refine their life purpose through thoughtful questions
2. Provide motivation and accountability for habit completion
3. Analyze patterns in journal entries to understand deeper motivations
4. Offer personalized advice based on their progress and challenges
5. Celebrate achievements and help overcome setbacks

Be encouraging, insightful, and focus on helping them understand their deeper 'why' behind their habits. Ask meaningful questions that lead to self-discovery.`
}