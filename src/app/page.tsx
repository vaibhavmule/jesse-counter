import { Metadata } from "next";
import { APP_NAME, APP_DESCRIPTION, APP_OG_IMAGE_URL, APP_URL } from "~/lib/constants";
import { getMiniAppEmbedMetadata } from "~/lib/utils";
import SimpleCounterPageClient from "./SimpleCounterPageClient";

export const revalidate = 300;

interface Props {
  searchParams: Promise<{
    count?: string;
  }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { count } = await searchParams;
  
  // If count is provided, use it for opengraph image (user's individual count)
  // Otherwise, use default opengraph image URL (total count)
  const imageUrl = count 
    ? `${APP_URL}/api/opengraph-image?count=${count}`
    : APP_OG_IMAGE_URL;

  return {
    title: APP_NAME,
    openGraph: {
      title: APP_NAME,
      description: APP_DESCRIPTION,
      images: [imageUrl],
    },
    other: {
      "fc:frame": JSON.stringify(getMiniAppEmbedMetadata(imageUrl)),
      "base:app_id": "694d666e4d3a403912ed7fa8",
    },
  };
}

export default function Home() {
  return <SimpleCounterPageClient />;
}
