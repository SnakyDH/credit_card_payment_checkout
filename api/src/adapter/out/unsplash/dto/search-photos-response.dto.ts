export interface SearchPhotosResponseDto {
  total: number;
  total_pages: number;
  results: SearchPhotosResultDto[];
}

export interface SearchPhotosResultDto {
  id: string;
  alternative_slugs: AlternativeSlugs;
  created_at: string;
  updated_at: string;
  promoted_at?: string;
  width: number;
  height: number;
  color: string;
  blur_hash: string;
  description?: string;
  breadcrumbs: any[];
  urls: Urls;
  likes: number;
  liked_by_user: boolean;
  bookmarked: boolean;
  current_user_collections: any[];
  sponsorship?: Sponsorship;
  topic_submissions: TopicSubmissions;
  asset_type: string;
  slug: string;
  alt_description: string;
  links: Links2;
  user: User;
}

export interface AlternativeSlugs {
  en: string;
  es: string;
  ja: string;
  fr: string;
  it: string;
  ko: string;
  de: string;
  pt: string;
  id: string;
}

export interface Urls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
  small_s3: string;
}

export interface Sponsorship {
  impression_urls: string[];
  tagline: string;
  tagline_url: string;
  sponsor: Sponsor;
}

export interface Sponsor {
  id: string;
  updated_at: string;
  username: string;
  name: string;
  first_name: string;
  last_name: any;
  twitter_username: string;
  portfolio_url: string;
  bio: string;
  location: string;
  links: Links;
  profile_image: ProfileImage;
  instagram_username: string;
  total_collections: number;
  total_likes: number;
  total_photos: number;
  total_free_photos: number;
  total_promoted_photos: number;
  total_illustrations: number;
  total_free_illustrations: number;
  total_promoted_illustrations: number;
  accepted_tos: boolean;
  for_hire: boolean;
  social: Social;
}

export interface Links {
  self: string;
  photos: string;
  likes: string;
  html: string;
}

export interface ProfileImage {
  small: string;
  medium: string;
  large: string;
}

export interface Social {
  instagram_username: string;
  portfolio_url: string;
  twitter_username: string;
  paypal_email: any;
}

export interface TopicSubmissions {
  'food-drink'?: FoodDrink;
  'business-work'?: BusinessWork;
}

export interface FoodDrink {
  status: string;
  approved_on: string;
}

export interface BusinessWork {
  status: string;
  approved_on?: string;
}

export interface Links2 {
  self: string;
  html: string;
  download: string;
  download_location: string;
}

export interface User {
  id: string;
  updated_at: string;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  twitter_username?: string;
  portfolio_url?: string;
  bio?: string;
  location?: string;
  links: Links3;
  profile_image: ProfileImage2;
  instagram_username?: string;
  total_collections: number;
  total_likes: number;
  total_photos: number;
  total_free_photos: number;
  total_promoted_photos: number;
  total_illustrations: number;
  total_free_illustrations: number;
  total_promoted_illustrations: number;
  accepted_tos: boolean;
  for_hire: boolean;
  social: Social2;
}

export interface Links3 {
  self: string;
  photos: string;
  likes: string;
  html: string;
}

export interface ProfileImage2 {
  small: string;
  medium: string;
  large: string;
}

export interface Social2 {
  instagram_username?: string;
  portfolio_url?: string;
  twitter_username?: string;
  paypal_email: any;
}
