'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Download, Trash2, AlertCircle, AlertTriangle } from 'lucide-react';

export default function DataProtectionPage() {
  const { data: session } = useSession();
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExportData = async () => {
    setExporting(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/privacy/data-export');
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export data');
      }

      const data = await response.json();
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gdpr-data-export-${session?.user?.email}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({
        type: 'success',
        text: 'Your data has been exported successfully. The download should start automatically.',
      });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to export data. Please try again or contact support.',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/privacy/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirm: true,
          reason: deleteReason || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      setMessage({
        type: 'success',
        text: 'Your account has been deleted successfully. You will be redirected to the home page.',
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to delete account. Please try again or contact support.',
      });
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-4xl font-bold mb-4">Data Protection & GDPR</CardTitle>
            <p className="text-gray-600 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Our Commitment</h2>
                <p>
                  AIFM Portal is committed to protecting your personal data and ensuring compliance with the General Data Protection Regulation (GDPR) and other applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Legal Basis for Processing</h2>
                <p>We process your personal data based on the following legal grounds:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Contract:</strong> To fulfill our contractual obligations</li>
                  <li><strong>Consent:</strong> When you have given explicit consent</li>
                  <li><strong>Legal obligation:</strong> To comply with legal requirements</li>
                  <li><strong>Legitimate interests:</strong> For business operations and improvement</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Your Rights</h2>
                <p>Under GDPR, you have the following rights:</p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.1 Right to Access</h3>
                <p>You can request a copy of all personal data we hold about you.</p>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.2 Right to Rectification</h3>
                <p>You can request correction of inaccurate or incomplete data.</p>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.3 Right to Erasure ("Right to be Forgotten")</h3>
                <p>You can request deletion of your personal data in certain circumstances.</p>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.4 Right to Restriction</h3>
                <p>You can request that we limit how we process your data.</p>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.5 Right to Data Portability</h3>
                <p>You can request your data in a structured, machine-readable format.</p>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.6 Right to Object</h3>
                <p>You can object to certain types of processing, including direct marketing.</p>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.7 Right to Withdraw Consent</h3>
                <p>Where processing is based on consent, you can withdraw it at any time.</p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Exercising Your Rights</h2>
                <p>You can exercise your GDPR rights directly through this portal:</p>

                {/* Data Export Section */}
                <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Download className="w-5 h-5 text-blue-900" />
                    Right to Access & Data Portability
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Download a complete copy of all your personal data in JSON format. This includes your profile, tasks, audit logs, and all associated information.
                  </p>
                  {session ? (
                    <Button
                      onClick={handleExportData}
                      disabled={exporting}
                      className="bg-blue-900 text-white hover:bg-blue-800"
                    >
                      {exporting ? 'Exporting...' : 'Export My Data'}
                      <Download className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <p className="text-sm text-gray-600 italic">Please sign in to export your data</p>
                  )}
                </div>

                {/* Delete Account Section */}
                <div className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-2xl">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Trash2 className="w-5 h-5 text-red-900" />
                    Right to Erasure ("Right to be Forgotten")
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Request deletion of your account and all associated personal data. This action cannot be undone. Business records (tasks, reports) will be preserved but anonymized.
                  </p>
                  {session ? (
                    <>
                      {!showDeleteConfirm ? (
                        <Button
                          onClick={() => setShowDeleteConfirm(true)}
                          variant="outline"
                          className="border-red-600 text-red-900 hover:bg-red-100"
                        >
                          Request Account Deletion
                          <AlertCircle className="w-4 h-4 ml-2" />
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          <div className="p-4 bg-white border-2 border-red-300 rounded-lg">
                            <p className="text-sm font-semibold text-red-900 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-900" />
                              Warning: This action is permanent!
                            </p>
                            <p className="text-sm text-gray-700 mb-4">
                              Your account will be permanently deleted. All personal data will be anonymized or removed. You will be logged out immediately.
                            </p>
                            <textarea
                              value={deleteReason}
                              onChange={(e) => setDeleteReason(e.target.value)}
                              placeholder="Optional: Reason for deletion"
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm"
                              rows={3}
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              onClick={handleDeleteAccount}
                              disabled={deleting}
                              className="bg-red-900 text-white hover:bg-red-800"
                            >
                              {deleting ? 'Deleting...' : 'Confirm Deletion'}
                              <Trash2 className="w-4 h-4 ml-2" />
                            </Button>
                            <Button
                              onClick={() => {
                                setShowDeleteConfirm(false);
                                setDeleteReason('');
                              }}
                              variant="outline"
                              className="border-gray-300"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-600 italic">Please sign in to delete your account</p>
                  )}
                </div>

                {/* Contact Option */}
                <div className="mt-6">
                  <p className="text-gray-700 mb-2">You can also contact us directly:</p>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> <a href="mailto:privacy@aifm.com" className="text-blue-600 hover:underline">privacy@aifm.com</a></p>
                    <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@aifm.com" className="text-blue-600 hover:underline">dpo@aifm.com</a></p>
                  </div>
                  <p className="mt-4 text-sm text-gray-600">
                    We will respond to your request within 30 days. We may ask for identification to verify your identity before processing your request.
                  </p>
                </div>

                {/* Message Display */}
                {message && (
                  <div className={`mt-4 p-4 rounded-lg ${
                    message.type === 'success' 
                      ? 'bg-green-100 border-2 border-green-300 text-green-900' 
                      : 'bg-red-100 border-2 border-red-300 text-red-900'
                  }`}>
                    {message.text}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Breach Notification</h2>
                <p>
                  In the event of a data breach that poses a risk to your rights and freedoms, we will notify you and the relevant supervisory authority within 72 hours, as required by GDPR.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Processing Agreements</h2>
                <p>
                  When we use third-party service providers (processors), we ensure they are bound by data processing agreements that comply with GDPR requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. International Data Transfers</h2>
                <p>
                  Your data may be transferred to and processed in countries outside the EU/EEA. We ensure appropriate safeguards are in place, such as Standard Contractual Clauses (SCCs) approved by the European Commission.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Retention</h2>
                <p>
                  We retain personal data only for as long as necessary to fulfill the purposes for which it was collected, comply with legal obligations, resolve disputes, and enforce our agreements. Retention periods vary depending on the type of data and legal requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Protection Officer</h2>
                <p>
                  We have appointed a Data Protection Officer (DPO) to oversee compliance with data protection laws. You can contact our DPO at: <a href="mailto:dpo@aifm.com" className="text-blue-600 hover:underline">dpo@aifm.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Complaints</h2>
                <p>
                  If you believe we have not handled your personal data correctly, you have the right to lodge a complaint with your local data protection authority. In Sweden, this is the Swedish Authority for Privacy Protection (Integritetsskyddsmyndigheten).
                </p>
                <p className="mt-4">
                  <strong>Swedish Authority for Privacy Protection:</strong><br />
                  Email: <a href="mailto:imy@imy.se" className="text-blue-600 hover:underline">imy@imy.se</a><br />
                  Website: <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.imy.se</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
                <p>For any questions about data protection, please contact:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@aifm.com" className="text-blue-600 hover:underline">dpo@aifm.com</a></p>
                  <p><strong>Privacy Team:</strong> <a href="mailto:privacy@aifm.com" className="text-blue-600 hover:underline">privacy@aifm.com</a></p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

