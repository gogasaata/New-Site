/** Night-time Earth visual (public/earth.webp) that slowly rotates about the globe's centre. */
export default function Earth({ src }: { src: string }) {
  return (
    <div className="earth-frame absolute inset-x-0 bottom-0 h-[340px] overflow-hidden mix-blend-multiply lg:bottom-0 lg:left-auto lg:right-0 lg:top-[60px] lg:h-auto lg:w-[66%]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="earth-spin h-full w-full select-none object-cover object-right" draggable={false} />
    </div>
  );
}
