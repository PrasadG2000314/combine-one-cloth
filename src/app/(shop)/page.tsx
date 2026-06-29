import HeroSlideshow from '@/components/home/HeroSlideshow';
import NewCollection from '@/components/home/NewCollection';
import CategoryGrid from '@/components/home/CategoryGrid';
import BestSellers from '@/components/home/BestSellers';
import PromoBanner from '@/components/home/PromoBanner';
import SubscribePopup from '@/components/home/SubscribePopup';

export default function Home() {
  return (
    <>
      <HeroSlideshow />
      <NewCollection />
      <CategoryGrid />
      <BestSellers />
      <PromoBanner />
      <SubscribePopup />
    </>
  );
}
