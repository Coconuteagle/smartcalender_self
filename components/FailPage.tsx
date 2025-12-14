import React from 'react';
import { useSearchParams } from 'react-router-dom';

const FailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const message = searchParams.get('message');
  const code = searchParams.get('code');

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold text-red-500 mb-4">결제 실패</h1>
      <p>결제 중 오류가 발생했습니다.</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <p><strong>Error Code:</strong> {code}</p>
        <p><strong>Error Message:</strong> {message}</p>
      </div>
    </div>
  );
};

export default FailPage;
