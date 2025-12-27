import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Manifest } from '@farcaster/miniapp-core/src/manifest';
import {
  APP_BUTTON_TEXT,
  APP_DESCRIPTION,
  APP_HERO_IMAGE_URL,
  APP_ICON_URL,
  APP_NAME,
  APP_OG_IMAGE_URL,
  APP_OG_TITLE,
  APP_PRIMARY_CATEGORY,
  APP_SCREENSHOT_URLS,
  APP_SPLASH_BACKGROUND_COLOR,
  APP_SPLASH_URL,
  APP_SUBTITLE,
  APP_TAGLINE,
  APP_TAGS,
  APP_URL,
  APP_WEBHOOK_URL,
  APP_ACCOUNT_ASSOCIATION,
} from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMiniAppEmbedMetadata(ogImageUrl?: string) {
  return {
    version: 'next',
    imageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    ogTitle: APP_OG_TITLE,
    ogDescription: APP_DESCRIPTION,
    ogImageUrl: ogImageUrl ?? APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: 'launch_frame',
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
        description: APP_DESCRIPTION,
        primaryCategory: APP_PRIMARY_CATEGORY,
        tags: APP_TAGS,
      },
    },
  };
}

export async function getFarcasterDomainManifest(): Promise<Manifest> {
  // Enforce Base Directory: max 5 tags
  const normalizedTags: string[] = (APP_TAGS ?? []).slice(0, 5);

  const miniappConfig = {
    version: '1',
    name: APP_NAME ?? 'JESSE Counter',
    homeUrl: APP_URL,
    iconUrl: APP_ICON_URL,
    imageUrl: APP_OG_IMAGE_URL,
    buttonTitle: APP_BUTTON_TEXT ?? 'Launch Mini App',
    splashImageUrl: APP_SPLASH_URL,
    splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
    webhookUrl: APP_WEBHOOK_URL,
    // Additional fields used by Base App Directory
    primaryCategory: APP_PRIMARY_CATEGORY,
    tags: normalizedTags,
    description: APP_DESCRIPTION,
    subtitle: APP_SUBTITLE,
    tagline: APP_TAGLINE,
    heroImageUrl: APP_HERO_IMAGE_URL,
    screenshotUrls: APP_SCREENSHOT_URLS.length > 0 ? APP_SCREENSHOT_URLS : undefined,
    ogTitle: APP_OG_TITLE,
    ogDescription: APP_DESCRIPTION,
    ogImageUrl: APP_OG_IMAGE_URL,
    noindex: false,
  } as unknown as Manifest['miniapp'];

  const manifest: any = {
    accountAssociation: APP_ACCOUNT_ASSOCIATION!,
    miniapp: miniappConfig,
  };

  return manifest as Manifest;
}
