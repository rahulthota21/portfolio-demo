import { themeScript } from '@/lib/theme';

export const metadata = {
  title: 'Console',
  robots: { index: false, follow: false },
};

export default function JackalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-ui min-h-screen bg-canvas">
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      {children}
    </div>
  );
}
