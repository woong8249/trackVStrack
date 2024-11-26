export function Footer() {
  return (
    <>
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

            <p
              className=" text-gray-600 underline"
            >
              woong8249@gmail.com
            </p>
          </p>

          {/* 저작권 정보 */}
          <p className="text-sm">
            ©
            {' '}
            {new Date().getFullYear()}
            {' '}
            Jiwoong Hwang. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  );
}
