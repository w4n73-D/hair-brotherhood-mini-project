import { notFound } from 'next/navigation';
import Image from 'next/image';
import { barberShops, newBarberShops, favBarberShops } from '../../data/shops'; // Ensure the path is correct

interface Shop {
  id: number;
  name: string;
  location: string;
  rating: number;
  price: string;
  description: string;
  imageUrl: string;
}

const findShopById = (id: number) => {
  return (
    barberShops.find(shop => shop.id === id) ||
    newBarberShops.find(shop => shop.id === id) ||
    favBarberShops.find(shop => shop.id === id) ||
    null
  );
};

const ShopPage = async ({ params }: { params: { id: string } }) => {
  const shopId = parseInt(params.id, 10);
  const shop = findShopById(shopId);

  if (!shop) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-4">{shop.name}</h1>
      <Image src={shop.imageUrl} alt={shop.name} width={800} height={600} className="mb-4" />
      <p className="text-lg mb-4">{shop.location}</p>
      <p className="text-lg mb-4">{shop.description}</p>
      <p className="text-lg mb-4">Rating: {shop.rating}</p>
      <p className="text-lg mb-4">Price: {shop.price}</p>
    </div>
  );
};

export default ShopPage;
