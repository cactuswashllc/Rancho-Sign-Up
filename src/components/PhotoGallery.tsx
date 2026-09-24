import Image from "next/image";

export function PhotoGallery({ images }: { images: { id: string; url: string; alt: string }[] }) {
  if (images.length === 0) return null;
  if (images.length === 1) {
    const img = images[0]!;
    return (
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-navy-100">
        <Image
          src={img.url}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }
  return (
    <ul
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0"
      aria-label="Event photos"
    >
      {images.map((img, i) => (
        <li
          key={img.id}
          className={`relative aspect-[4/3] w-[80%] shrink-0 snap-center overflow-hidden rounded-lg bg-navy-100 sm:w-auto ${
            i === 0 ? "sm:col-span-2 sm:row-span-2 sm:aspect-auto" : ""
          }`}
        >
          <Image
            src={img.url}
            alt={img.alt}
            fill
            sizes="(min-width: 640px) 33vw, 80vw"
            className="object-cover"
            priority={i === 0}
          />
        </li>
      ))}
    </ul>
  );
}
