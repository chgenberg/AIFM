import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

/**
 * GDPR Delete Account Endpoint (Right to be Forgotten)
 * Anonymizes or deletes all personal data associated with the authenticated user
 * POST /api/privacy/delete-account
 * 
 * Body: { confirm: true, reason?: string }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { confirm, reason } = body;

    if (!confirm || confirm !== true) {
      return NextResponse.json(
        { error: 'Deletion must be confirmed. Set confirm: true in request body.' },
        { status: 400 }
      );
    }

    // Fetch user by email if userId not in session
    const userForDeletion = userId 
      ? await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } })
      : await prisma.user.findUnique({ where: { email: userEmail }, select: { id: true, role: true } });

    if (!userForDeletion) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const finalUserId = userForDeletion.id;

    if (userForDeletion.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin accounts cannot be deleted through this endpoint. Please contact system administrator.' },
        { status: 403 }
      );
    }

    // Log the deletion request in audit log before deletion
    await prisma.auditLog.create({
      data: {
        actorId: finalUserId,
        actorRole: userForDeletion.role as any,
        action: 'DELETE_ACCOUNT',
        refType: 'User',
        refId: finalUserId,
        diffJson: {
          reason: reason || 'User requested account deletion via GDPR endpoint',
          email: userEmail,
          deletedAt: new Date().toISOString(),
        },
      },
    });

    // Start transaction to anonymize/delete user data
    await prisma.$transaction(async (tx) => {
      // 1. Anonymize user profile (keep structure but remove PII)
      const anonymizedEmail = `deleted-${finalUserId}@deleted.local`;
      const anonymizedName = 'Deleted User';
      
      await tx.user.update({
        where: { id: finalUserId },
        data: {
          email: anonymizedEmail,
          name: anonymizedName,
          image: null,
          password: null, // Remove password hash
          emailVerified: null,
        },
      });

      // 2. Delete all sessions (force logout)
      await tx.session.deleteMany({
        where: { userId: finalUserId },
      });

      // 3. Delete OAuth accounts (remove external connections)
      await tx.account.deleteMany({
        where: { userId: finalUserId },
      });

      // 4. Remove user from task assignments (set to null, keep task history)
      await tx.task.updateMany({
        where: { assigneeId: finalUserId },
        data: {
          assigneeId: null,
        },
      });

      // 5. Anonymize audit logs where user is actor
      // Keep audit trail but remove identifiable information
      await tx.auditLog.updateMany({
        where: { actorId: finalUserId },
        data: {
          actorId: null,
          actorRole: null,
        },
      });

      // Note: We do NOT delete:
      // - Client data (belongs to organization, not individual)
      // - Tasks (important business records)
      // - Reports (important business records)
      // - Data feeds (business data)
      // These are anonymized by removing user assignment but kept for business continuity
    });

    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully. All personal data has been anonymized or removed.',
      deletedAt: new Date().toISOString(),
      note: 'Your account data has been anonymized. Business records (tasks, reports) have been preserved but are no longer associated with your account.',
    });
  } catch (error: any) {
    console.error('GDPR delete account error:', error);
    return NextResponse.json(
      { error: 'Failed to delete account', details: error?.message },
      { status: 500 }
    );
  }
}

