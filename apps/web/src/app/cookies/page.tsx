'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-4xl font-bold mb-4">Cookie Policy</CardTitle>
            <p className="text-gray-600 text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h2>
                <p>We use cookies for the following purposes:</p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">2.1 Essential Cookies</h3>
                <p>These cookies are necessary for the website to function properly. They enable core functionality such as authentication and session management.</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Authentication cookies (session management)</li>
                  <li>Security cookies (CSRF protection)</li>
                  <li>Load balancing cookies</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">2.2 Functional Cookies</h3>
                <p>These cookies enhance functionality and personalization:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Language preferences</li>
                  <li>User interface preferences</li>
                  <li>Remembering your login state</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">2.3 Analytics Cookies</h3>
                <p>These cookies help us understand how visitors interact with our website:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Page views and navigation patterns</li>
                  <li>Feature usage statistics</li>
                  <li>Error tracking</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
                <table className="w-full border-collapse border border-gray-300 mt-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Cookie Name</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">next-auth.session-token</td>
                      <td className="border border-gray-300 px-4 py-2">Authentication and session management</td>
                      <td className="border border-gray-300 px-4 py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">next-auth.csrf-token</td>
                      <td className="border border-gray-300 px-4 py-2">Security (CSRF protection)</td>
                      <td className="border border-gray-300 px-4 py-2">Session</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">user-preferences</td>
                      <td className="border border-gray-300 px-4 py-2">Storing user interface preferences</td>
                      <td className="border border-gray-300 px-4 py-2">1 year</td>
                    </tr>
                  </tbody>
                </table>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
                <p>We may use third-party services that set cookies:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>OpenAI:</strong> For AI processing (subject to OpenAI's privacy policy)</li>
                  <li><strong>Analytics providers:</strong> To understand usage patterns (if enabled)</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Managing Cookies</h2>
                <p>You can control and manage cookies in several ways:</p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Browser Settings</h3>
                <p>Most browsers allow you to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>View and delete cookies</li>
                  <li>Block cookies from specific sites</li>
                  <li>Block all cookies</li>
                  <li>Delete all cookies when you close your browser</li>
                </ul>
                
                <p className="mt-4">
                  <strong>Note:</strong> Blocking essential cookies may affect the functionality of our website. You may not be able to log in or use certain features.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cookie Consent</h2>
                <p>
                  By using our website, you consent to our use of cookies in accordance with this Cookie Policy. You can withdraw your consent at any time by adjusting your browser settings or contacting us.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time. We will notify you of any changes by posting the new policy on this page.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
                <p>
                  If you have questions about our use of cookies, please contact us at: <a href="mailto:privacy@aifm.com" className="text-blue-600 hover:underline">privacy@aifm.com</a>
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

