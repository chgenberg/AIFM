import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

export default function SignInPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <SignIn 
        appearance={{
          baseTheme: dark,
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl',
            headerTitle: 'text-white text-2xl font-bold',
            headerSubtitle: 'text-gray-400',
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 rounded-2xl',
            footerActionLink: 'text-blue-400 hover:text-blue-300',
          }
        }}
      />
    </div>
  );
}
