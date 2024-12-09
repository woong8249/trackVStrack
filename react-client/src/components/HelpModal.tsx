import { useModal } from '@hooks/useModal';
import { ReactNode } from 'react';
import { RxQuestionMarkCircled } from 'react-icons/rx';

type Prob ={
    children:ReactNode
}

export function HelpModal({ children }:Prob) {
  const {
    isModalOpen,
    setIsModalOpen,
    modalRef,
  } = useModal();

  return (
    <div className='flex items-center'>
      <button onClick ={(e) => { e.stopPropagation(); setIsModalOpen((pre) => !pre); }}>
        <RxQuestionMarkCircled size={17} />
      </button>

      { isModalOpen && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-30">
          <div
          ref={modalRef}
          className="px-6 py-6 flex flex-col bg-white rounded-lg max-w-md shadow-lg"
          role="dialog"
          aria-labelledby="chart-comparison-title"
          aria-describedby="chart-comparison-description"
        >
            {children}
          </div>
        </div>

      )}
    </div>
  );
}
