'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';

export default function DataProtectionPage() {
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
                <p>To exercise any of these rights, please contact us:</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Email:</strong> <a href="mailto:privacy@aifm.com" className="text-blue-600 hover:underline">privacy@aifm.com</a></p>
                  <p><strong>Data Protection Officer:</strong> <a href="mailto:dpo@aifm.com" className="text-blue-600 hover:underline">dpo@aifm.com</a></p>
                </div>
                <p className="mt-4">
                  We will respond to your request within 30 days. We may ask for identification to verify your identity before processing your request.
                </p>
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

