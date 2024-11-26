import TopNavBar from '@layouts/TopNavBar';
import HomeSection1 from '@sections/HomeSection1';
import { HomeSection2 } from '@sections/HomeSection2';
import { HomeSection3 } from '@sections/HomeSection3';

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center min-w-[350px]">
        <TopNavBar currentPage="home" />
        <HomeSection1></HomeSection1>
        <HomeSection2></HomeSection2>
        <HomeSection3></HomeSection3>
      </div>
    </>
  );
}
