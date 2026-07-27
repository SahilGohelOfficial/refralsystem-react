import { Image as UnpicImage, type ImageProps as UnpicImageProps } from '@unpic/react';

type FullWidthUnpicProps = Extract<UnpicImageProps, { layout: 'fullWidth' }>;

export type ImageProps = Omit<FullWidthUnpicProps, 'layout' | 'objectFit'> & {
  objectFit?: FullWidthUnpicProps['objectFit'];
};

export default function Image({
  objectFit = 'contain',
  className = '',
  ...props
}: ImageProps) {
  return (
    <UnpicImage
      layout="fullWidth"
      objectFit={objectFit}
      className={className}
      {...props}
    />
  );
}
