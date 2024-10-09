import VideoStream from "@/stream";

export default function Home(props: any) {
  const { width, height } = props;

  return (
    <div className="w-screen h-screen grid grid-cols-7 bg-gray-900">
      <div className="col-span-2">

      </div>
      <div className="col-span-5">
        <VideoStream
          width={width}
          height={height}
        />
      </div>
    </div>
  );
}
