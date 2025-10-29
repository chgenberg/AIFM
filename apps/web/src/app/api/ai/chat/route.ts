import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Get system context
    const [tasks, reports, clients] = await Promise.all([
      prisma.task.findMany({
        take: 50,
        orderBy: { updatedAt: 'desc' },
        include: {
          client: { select: { name: true } },
          flags: true,
        },
      }),
      prisma.report.findMany({
        take: 30,
        orderBy: { updatedAt: 'desc' },
        include: {
          client: { select: { name: true } },
        },
      }),
      prisma.client.findMany({
        take: 20,
        select: { id: true, name: true },
      }),
    ]);

    // Build context string
    const context = `
SYSTEM CONTEXT:
- Total Tasks: ${tasks.length}
- Total Reports: ${reports.length}
- Total Clients: ${clients.length}

RECENT TASKS:
${tasks.map(t => `- ${t.kind} (${t.status}) for ${t.client?.name || 'Unknown'}: ${t.flags.length} flags`).join('\n')}

RECENT REPORTS:
${reports.map(r => `- ${r.type} (${r.status}) for ${r.client?.name || 'Unknown'}`).join('\n')}

CLIENTS:
${clients.map(c => `- ${c.name} (${c.id})`).join('\n')}
`.trim();

    // Call OpenAI with system context
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-5-mini',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for AIFM Portal, a fund accounting system. You have full insight into the system and can help users with:

1. Explaining what's happening in the system
2. Providing insights about tasks and reports
3. Helping with decisions and recommendations
4. Explaining workflows and processes
5. Analyzing data and identifying patterns

Always use English and be professional but friendly. You have access to real-time data from the system.`,
        },
        {
          role: 'user',
          content: `System Context:\n${context}\n\nUser Question: ${message}`,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 });
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'Failed to process chat message' }, { status: 500 });
  }
}

