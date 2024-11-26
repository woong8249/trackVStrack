export function Footer() {
  return (
    <footer className=" text-gray-400 py-6">
      <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
        {/* 서비스 소개 */}
        <p className="text-sm">
          This service helps you easily compare and analyze platform chart performance.
        </p>

        {/* 연락처 정보 */}
        <p className="text-sm">
          📧 Contact:
          {' '}
          <a href="mailto:woong8249@gmail.com" className="text-gray-400 hover:text-black">woong8249@gmail.com</a>
        </p>

        {/* 저작권 정보 */}
        <p className="text-sm">
          ©
          {' '}
          {new Date().getFullYear()}
          {' '}
          Jiwwong Hwang. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
