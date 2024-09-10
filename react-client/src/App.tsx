function App() {
  return (
    <>
      <div className="flex bg-neutral-700 items-center justify-between h-[13rem] group" >
        <div className="flex gap-4 group-hover:bg-yellow-400">
          <div className="bg-white w-[1rem] h-[11rem]"></div>
          <div className="bg-white w-[1rem] h-[11rem]"></div>
          <div className="bg-white w-[1rem] h-[11rem]"></div>
          <div className="bg-white w-[1rem] h-[11rem]"></div>
          <div className="bg-white w-[1rem] h-[11rem]"></div>
        </div>

        <div className="flex justify-center items-center gap-2 ">
          <div className="bg-red-500 w-32 h-32 rounded-full hover:bg-red-100 transition border-black  border-[2px]"></div>
          <div className="bg-yellow-500 w-32 h-32 rounded-full hover:bg-red-100 transition border-black  border-[2px] "></div>
          <div className="bg-green-500 w-32 h-32 rounded-full hover:bg-red-100 transition border-black  border-[2px] "></div>
        </div>

        <div className="flex gap-4 group-hover:bg-yellow-400">
          <div className="bg-white w-[1rem] h-[11rem]"></div>
          <div className="bg-white w-[1rem] h-[11rem]"></div>
          <div className="bg-white w-[1rem] h-[11rem]"></div>
          <div className="bg-white w-[1rem] h-[11rem]"></div>
          <div className="bg-white w-[1rem] h-[11rem]"></div>
        </div>
      </div>

    </>
  );
}
export default App;
