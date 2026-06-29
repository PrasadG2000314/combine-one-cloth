import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { validateSession } from '@/lib/auth';
import AdminDashboardClient from './AdminDashboardClient';

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  const isAuth = validateSession(token);

  if (!isAuth) {
    redirect('/admin');
  }

  return <AdminDashboardClient />;
}
