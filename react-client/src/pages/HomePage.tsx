import TopNavBar from '@layouts/TopNavBar';
import HomeSection1 from '@sections/HomeSection1';
import HomeSection2 from '@sections/HomeSection2';

export default function Test2MainPage() {
  return (
    <>
      <div className="min-h-screen flex flex-col items-center min-w-[350px]">
        <TopNavBar currentPage="home" />
        <HomeSection1></HomeSection1>
        <HomeSection2></HomeSection2>
      </div>
    </>
  );
}
