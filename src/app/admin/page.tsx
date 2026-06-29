import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession, initializeAdminIfMissing } from '@/lib/auth';
import AdminLoginForm from './AdminLoginForm';

export default async function AdminPage() {
  // Initialize admin config and output credentials if missing
  initializeAdminIfMissing();

  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const isAuth = validateSession(token);

  if (isAuth) {
    redirect('/admin/dashboard');
  }

  return <AdminLoginForm />;
}
