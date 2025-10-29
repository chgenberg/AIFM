import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GDPR Data Export Endpoint
 * Exports all personal data associated with the authenticated user
 * GET /api/privacy/data-export
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;
    const userEmail = session.user?.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found in session' },
        { status: 400 }
      );
    }

    // Fetch user by email if userId not in session
    let userForExport = userId 
      ? await prisma.user.findUnique({ where: { id: userId } })
      : await prisma.user.findUnique({ where: { email: userEmail } });

    if (!userForExport) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const finalUserId = userForExport.id;

    // Fetch all user data
    const [user, tasks, auditLogs, sessions, accounts, client] = await Promise.all([
      // User profile
      prisma.user.findUnique({
        where: { id: finalUserId },
        include: {
          client: {
            select: {
              id: true,
              name: true,
              orgNo: true,
              tier: true,
            },
          },
        },
      }),
      // Tasks assigned to user
      prisma.task.findMany({
        where: { assigneeId: finalUserId },
        include: {
          flags: true,
          client: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      // Audit logs where user is actor
      prisma.auditLog.findMany({
        where: { actorId: finalUserId },
        orderBy: { createdAt: 'desc' },
        take: 1000, // Limit to last 1000 entries
      }),
      // Active sessions
      prisma.session.findMany({
        where: { userId: finalUserId },
        orderBy: { createdAt: 'desc' },
      }),
      // OAuth accounts
      prisma.account.findMany({
        where: { userId: finalUserId },
      }),
      // Client data if user is associated with a client
      prisma.user.findUnique({
        where: { id: finalUserId },
        select: {
          clientId: true,
        },
      }).then(async (user) => {
        if (!user?.clientId) return null;
        return prisma.client.findUnique({
          where: { id: user.clientId },
          include: {
            contacts: true,
            subscriptions: true,
            dataFeeds: {
              select: {
                id: true,
                source: true,
                status: true,
                lastSyncAt: true,
                createdAt: true,
              },
            },
          },
        });
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build comprehensive data export
    const exportData = {
      exportDate: new Date().toISOString(),
      exportFormat: 'json',
      version: '1.0',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      client: client ? {
        id: client.id,
        name: client.name,
        orgNo: client.orgNo,
        tier: client.tier,
        contacts: client.contacts.map(c => ({
          email: c.email,
          name: c.name,
          role: c.role,
          phone: c.phone,
        })),
        subscriptions: client.subscriptions.map(s => ({
          plan: s.plan,
          active: s.active,
          sla: s.sla,
          startedAt: s.startedAt,
          endedAt: s.endedAt,
        })),
        dataFeeds: client.dataFeeds,
      } : null,
      tasks: tasks.map(task => ({
        id: task.id,
        kind: task.kind,
        status: task.status,
        payload: task.payload,
        comment: task.comment,
        flags: task.flags.map(flag => ({
          severity: flag.severity,
          message: flag.message,
          code: flag.code,
          createdAt: flag.createdAt,
        })),
        client: task.client,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
        dueAt: task.dueAt,
      })),
      auditLogs: auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        refType: log.refType,
        refId: log.refId,
        diffJson: log.diffJson,
        ip: log.ip,
        createdAt: log.createdAt,
      })),
      sessions: sessions.map(session => ({
        id: session.id,
        createdAt: session.createdAt,
        expires: session.expires,
      })),
      accounts: accounts.map(account => ({
        id: account.id,
        type: account.type,
        provider: account.provider,
        createdAt: account.id, // Don't expose sensitive tokens
      })),
      summary: {
        totalTasks: tasks.length,
        totalAuditLogs: auditLogs.length,
        activeSessions: sessions.filter(s => s.expires > new Date()).length,
        connectedAccounts: accounts.length,
        hasClient: !!client,
      },
    };

    // Return as JSON with proper headers for download
    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="gdpr-data-export-${userEmail}-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('GDPR data export error:', error);
    return NextResponse.json(
      { error: 'Failed to export data', details: error?.message },
      { status: 500 }
    );
  }
}

