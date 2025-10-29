'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-4xl font-bold mb-4">Privacy Policy</CardTitle>
            <p className="text-gray-600 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                <p>
                  AIFM Portal ("we", "our", "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our AI-powered fund management platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">2.1 Personal Information</h3>
                <p>We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name and email address</li>
                  <li>Organization details</li>
                  <li>Role and permissions</li>
                  <li>Financial data related to fund management</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">2.2 Usage Information</h3>
                <p>We automatically collect certain information when you use our services:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>IP address and browser type</li>
                  <li>Pages visited and actions taken</li>
                  <li>Device information</li>
                  <li>Session data and timestamps</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                <p>We use the collected information to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide and maintain our services</li>
                  <li>Process fund accounting tasks and reports</li>
                  <li>Improve our AI-powered features</li>
                  <li>Ensure security and prevent fraud</li>
                  <li>Comply with legal obligations</li>
                  <li>Communicate with you about your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
                <p>We do not sell your personal information. We may share your information only:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                <p>
                  We implement industry-standard security measures to protect your information, including encryption, secure servers, and access controls. However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights (GDPR)</h2>
                <p>Under GDPR, you have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Access:</strong> Request a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                  <li><strong>Restriction:</strong> Limit how we process your data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, please contact us at: <a href="mailto:privacy@aifm.com" className="text-blue-600 hover:underline">privacy@aifm.com</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Retention</h2>
                <p>
                  We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies</h2>
                <p>
                  We use cookies and similar technologies to enhance your experience. For detailed information about our cookie usage, please see our <a href="/cookies" className="text-blue-600 hover:underline">Cookie Policy</a>.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with GDPR requirements.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Children's Privacy</h2>
                <p>
                  Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us:
                </p>
                <div className="mt-4 space-y-1">
                  <p><strong>Email:</strong> <a href="mailto:privacy@aifm.com" className="text-blue-600 hover:underline">privacy@aifm.com</a></p>
                  <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@aifm.com" className="text-blue-600 hover:underline">dpo@aifm.com</a></p>
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

