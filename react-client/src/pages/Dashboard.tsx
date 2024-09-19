import HeaderSearch from '@layouts/HeaderSearch';

function Dashboard() {
  return (
    <div className="bg-[#fff] text-[#3D3D3D] min-w-[370px]  ">
      <HeaderSearch></HeaderSearch>

      <div className='bg-gray-100 rounded-3xl flex justify-center items-center min-h-screen  m-[2rem] '>
        <p className='text-gray-400'>Add tracks</p>
      </div>
    </div>
  );
}

export default Dashboard;
