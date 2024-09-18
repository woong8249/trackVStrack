import Logo from '@components/Logo';
import SearchModal from '@layouts/SearchModal';

export default function HeaderSearch() {
  return (
    <div className='flex justify-center items-center gap-[1rem] my-[1rem] mx-[2rem] flex-col'>
      <Logo ></Logo>
      <SearchModal></SearchModal>
    </div>
  );
}
