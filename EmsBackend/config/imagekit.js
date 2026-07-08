import ImageKit from "imagekit";

let imagekit;
if (
  process.env.IMAGEKIT_PUBLIC_KEY &&
  process.env.IMAGEKIT_PRIVATE_KEY &&
  process.env.IMAGEKIT_URL_ENDPOINT
) {
  imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
  });
} else {
  const notConfiguredError = () =>
    new Error(
      'ImageKit not configured. Set IMAGEKIT_PUBLIC_KEY, IMAGEKIT_PRIVATE_KEY and IMAGEKIT_URL_ENDPOINT in your .env'
    );

  imagekit = {
    upload: async () => {
      throw notConfiguredError();
    },
    deleteFile: async () => {
      throw notConfiguredError();
    },
    url: (options = {}) => {
      throw notConfiguredError();
    },
    _isStub: true,
  };
}

export default imagekit;
