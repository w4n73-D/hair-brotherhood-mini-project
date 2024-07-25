import HeaderNav from "./header/page";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen flex">
      <HeaderNav />
        <div className="w-1/2 bg-gradient-to-r from-purple-200 to-blue-200 p-10 flex items-center justify-center">
          <div>
            <h1 className="text-4xl font-bold mb-4">Welcome To <br />Hair-Brotherhood</h1>
            <p className="mb-4">
              Here our aim is to connect people to their favorite barbers or any barber around them with ease.
            </p>
            <p className="mb-4">
              To find the closest barbershop around, click here:
            </p>
            <div className="flex">
              <input
                type="text"
                placeholder="Enter your location"
                className="border p-2 rounded-l"
              />
              <button className="bg-orange-500 text-white p-2 rounded-r">Search</button>
            </div>
          </div>
        </div>
      <div className="w-1/2 relative">
        <Image
          src="/halfbackground.jpg"
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          quality={100}
        />
      </div>
  </div>
  );
}
