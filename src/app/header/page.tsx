import Image from 'next/image';


export default function HeaderNav() {
  return (
    <div className="flex fixed top-0 w-full justify-between items-center px-10 bg-opacity-75 py-4 z-10">
      <div className="">
        <a href="#">
          <Image
            src="/logo/hairbrotherhoodLOGO.png"
            alt="Logo"
            width={300}
            height={100}
          />
        </a>
      </div>
      <div className='flex items-center'>
          <ul className="flex space-x-8 text-white">
          <li><a href="#" className="hover:underline">Log In</a></li>
          <li><a href="#" className="hover:underline">partners</a></li>
          <li><a href="#" className="hover:underline">Contact us</a></li>
        </ul>
      </div>
    </div>
  );
}
  