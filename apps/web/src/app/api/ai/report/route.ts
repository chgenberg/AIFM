import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { clientName, reportType, data } = await request.json();

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional fund accounting report writer. Generate professional, accurate reports.`,
        },
        {
          role: 'user',
          content: `Generate a ${reportType} report for ${clientName}. Data: ${JSON.stringify(data)}`,
        },
      ],
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Report generation failed' },
      { status: 500 }
    );
  }
}
