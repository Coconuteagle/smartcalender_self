import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// 실제 결제 데이터를 담을 타입 정의
interface PaymentData {
  mId: string;
  version: string;
  paymentKey: string;
  status: string;
  orderId: string;
  orderName: string;
  totalAmount: number;
  method: string;
  card: {
    number: string;
    cardType: string;
  } | null;
  virtualAccount: {
    accountNumber: string;
    bankCode: string;
    dueDate: string;
  } | null;
  // 필요한 다른 결제 수단 정보들을 추가할 수 있습니다.
}

const SuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const paymentKey = searchParams.get('paymentKey');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');

    const confirmPayment = async () => {
      try {
        // 백엔드 서버에 결제 승인 요청을 보냅니다.
        // '/api/confirm-payment'는 직접 구현해야 하는 백엔드 API 엔드포인트입니다.
        const response = await fetch('/api/confirm-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentKey,
            orderId,
            amount,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          // 서버에서 에러 응답을 보낸 경우
          throw new Error(data.message || '결제 승인에 실패했습니다.');
        }

        // 성공적으로 결제 정보를 받아오면 상태에 저장합니다.
        setPaymentData(data);
      } catch (err: any) {
        console.error("Payment confirmation error:", err);
        setError(err.message || '결제 정보를 불러오는 중 오류가 발생했습니다.');
      }
    };

    if (paymentKey && orderId && amount) {
      confirmPayment();
    } else {
      setError('결제 정보가 올바르지 않습니다. URL 파라미터를 확인해주세요.');
    }
  }, [searchParams]);

  if (error) {
    return (
        <div className="p-8 text-center max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-red-600 mb-4">오류 및 안내</h1>
            <p className="text-slate-700 bg-red-100 p-4 rounded-lg">{error}</p>
            <div className="mt-8 text-center">
                <button 
                  onClick={() => navigate('/')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-lg"
                >
                  홈으로 돌아가기
                </button>
            </div>
        </div>
    );
  }

  if (!paymentData) {
    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">결제 정보 확인 중...</h1>
            <p className="text-slate-600">백엔드 서버로부터 결제 승인 결과를 기다리고 있습니다.</p>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600">결제 성공</h1>
        <p className="text-slate-600 mt-2">주문이 성공적으로 완료되었습니다.</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">결제 정보</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">주문 번호:</span>
            <span className="text-slate-800">{paymentData.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">주문명:</span>
            <span className="text-slate-800">{paymentData.orderName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">결제 금액:</span>
            <span className="text-slate-800 font-bold">{paymentData.totalAmount.toLocaleString()}원</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">결제 수단:</span>
            <span className="text-slate-800">{paymentData.method}</span>
          </div>
          {paymentData.card && (
            <div className="pt-2 border-t mt-2">
              <p className="font-semibold text-slate-600 mb-1">카드 정보</p>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                    <span className="text-slate-500">카드 종류:</span>
                    <span className="text-slate-800">{paymentData.card.cardType}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">카드 번호:</span>
                    <span className="text-slate-800">{paymentData.card.number}</span>
                </div>
              </div>
            </div>
          )}
           {paymentData.virtualAccount && (
            <div className="pt-2 border-t mt-2">
              <p className="font-semibold text-slate-600 mb-1">가상계좌 정보</p>
              <div className="pl-4 space-y-1">
                <div className="flex justify-between">
                    <span className="text-slate-500">은행:</span>
                    <span className="text-slate-800">{paymentData.virtualAccount.bankCode}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-slate-500">계좌번호:</span>
                    <span className="text-slate-800">{paymentData.virtualAccount.accountNumber}</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-slate-500">입금 기한:</span>
                    <span className="text-slate-800">{paymentData.virtualAccount.dueDate}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
