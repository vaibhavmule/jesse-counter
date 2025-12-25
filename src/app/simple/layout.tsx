import { Metadata } from 'next';
import { APP_URL, APP_NAME, APP_DESCRIPTION } from '~/lib/constants';

export const revalidate = 60;

export const metadata: Metadata = {
  title: `${APP_NAME} - $JESSE Counter`,
  description: APP_DESCRIPTION,
  openGraph: {
    title: '$JESSE COUNTER',
    description: 'LIVE ON-CHAIN COUNT',
    images: [
      {
        url: `${APP_URL}/simple/opengraph-image`,
        width: 1200,
        height: 630,
        alt: '$JESSE Counter',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '$JESSE COUNTER',
    description: 'LIVE ON-CHAIN COUNT',
    images: [`${APP_URL}/simple/opengraph-image`],
  },
};

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

