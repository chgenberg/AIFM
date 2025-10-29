'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-4xl font-bold mb-4">Terms of Service</CardTitle>
            <p className="text-gray-600 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
                <p>
                  By accessing or using AIFM Portal ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                <p>
                  AIFM Portal is an AI-powered fund management platform that provides automated bank reconciliation, KYC review, and intelligent report generation services. The Service is designed for professional fund management organizations and their authorized personnel.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.1 Account Creation</h3>
                <p>To use our Service, you must:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Be at least 18 years old</li>
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">3.2 Account Responsibilities</h3>
                <p>You are responsible for:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Maintaining the confidentiality of your password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us immediately of unauthorized access</li>
                  <li>Ensuring compliance with applicable laws and regulations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Use the Service for any illegal purpose</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                  <li>Transmit viruses, malware, or harmful code</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Interfere with or disrupt the Service</li>
                  <li>Use automated systems to access the Service without permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property</h2>
                <p>
                  The Service and its original content, features, and functionality are owned by AIFM Portal and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
                <p className="mt-4">
                  You retain ownership of any data you upload to the Service. By using the Service, you grant us a license to use, process, and store your data solely for the purpose of providing the Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Service Availability</h2>
                <p>
                  We strive to maintain high availability but do not guarantee uninterrupted access. The Service may be unavailable due to maintenance, updates, or circumstances beyond our control. We reserve the right to modify or discontinue the Service at any time.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. AI-Generated Content</h2>
                <p>
                  Our Service uses artificial intelligence to generate reports and analyses. While we strive for accuracy, AI-generated content may contain errors. You are responsible for reviewing and verifying all AI-generated content before using it for business decisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, AIFM PORTAL SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR BUSINESS INTERRUPTION.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Indemnification</h2>
                <p>
                  You agree to indemnify and hold harmless AIFM Portal from any claims, damages, losses, liabilities, and expenses arising from your use of the Service or violation of these Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
                <p>
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Sweden, without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
                <p>
                  We reserve the right to modify these Terms at any time. We will notify users of any material changes. Your continued use of the Service after such modifications constitutes acceptance of the updated Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
                <p>
                  If you have questions about these Terms, please contact us at: <a href="mailto:legal@aifm.com" className="text-blue-600 hover:underline">legal@aifm.com</a>
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

