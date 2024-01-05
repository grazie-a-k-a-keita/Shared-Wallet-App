import { useEffect, useRef, useState } from 'react';

import axios from 'axios';

import { getCurrentDay } from '../configs/util';

import type { RegistrationData } from '../types/api';
import type { CardInfo } from '../types/type';

function useInputPage() {
  // トグルボタンの状態管理
  const [toggleState, setToggleState] = useState<boolean>(true);
  // 支出情報の状態管理
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [cardCount, setCardCount] = useState<number>(1);
  const [spendingDateInfo, setSpendingDateInfo] = useState<string>(getCurrentDay());
  const [spendingCategoryInfo, setSpendingCategoryInfo] = useState<number>(1);
  const [spendingMemoInfo, setSpendingMemoInfo] = useState<string>('');
  const [cardInfo, setCardInfo] = useState<CardInfo>([{ memo: '', amount: 0, valid: true }]);
  // 補充情報の状態管理
  const [incomeDateInfo, setIncomeDateInfo] = useState<string>(getCurrentDay());
  const [incomeMemoInfo, setIncomeMemoInfo] = useState<string>('');
  const [incomeAmountInfo, setIncomeAmountInfo] = useState<number>(0);
  // ローディング画面の状態管理
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // HTML要素
  const scrollTopRef = useRef<HTMLDivElement>(null);
  const scrollBottomRef = useRef<HTMLDivElement>(null);

  // 合計金額を算出する
  useEffect(() => {
    let tempAmount = 0;
    cardInfo.forEach((item) => {
      if (item.valid === true) tempAmount += item.amount;
    });
    setTotalAmount(tempAmount);
  }, [cardInfo]);

  // カードを追加する
  const handleAddCard = () => {
    // カードを追加
    setCardCount(cardCount + 1);

    // カードの入力情報を追加
    const newInputCardInfo = [...cardInfo];
    newInputCardInfo.push({ memo: '', amount: 0, valid: true });
    setCardInfo(newInputCardInfo);

    // カード追加時に一番下までスクロール
    setTimeout(() => {
      scrollBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 1);
  };

  // 保存ボタン押下時の処理
  const saveButtonClick = async () => {
    setIsLoading(true);

    const data: RegistrationData = {
      paymentDate: '',
      paymentType: true,
      totalAmount: 0,
      categoryID: 0,
      memo: '',
      memos: [],
    };

    if (toggleState) {
      data.paymentDate = spendingDateInfo;
      data.paymentType = true;
      data.totalAmount = totalAmount;
      data.categoryID = spendingCategoryInfo;
      data.memo = spendingMemoInfo;
      cardInfo.forEach((item) => {
        if (item.valid) {
          data.memos.push({ memo: item.memo, amount: item.amount });
        }
      });
    }

    if (!toggleState) {
      data.paymentDate = incomeDateInfo;
      data.paymentType = false;
      data.totalAmount = incomeAmountInfo;
      data.memo = incomeMemoInfo;
    }

    try {
      await axios.post(import.meta.env.VITE_POST_PAYMENT_REGISTRATION, data);
    } catch (error) {
      setIsLoading(false);
      return;
    }

    // 入力情報をリセット
    setCardCount(0);
    setSpendingDateInfo(getCurrentDay());
    setSpendingCategoryInfo(1);
    setSpendingMemoInfo('');
    setCardInfo([]);
    setIncomeDateInfo(getCurrentDay());
    setIncomeMemoInfo('');
    setIncomeAmountInfo(0);

    setIsLoading(false);
  };

  return {
    // useState
    toggleState,
    setToggleState,
    totalAmount,
    cardCount,
    spendingDateInfo,
    setSpendingDateInfo,
    spendingCategoryInfo,
    setSpendingCategoryInfo,
    spendingMemoInfo,
    setSpendingMemoInfo,
    cardInfo,
    setCardInfo,
    incomeDateInfo,
    setIncomeDateInfo,
    incomeMemoInfo,
    setIncomeMemoInfo,
    incomeAmountInfo,
    setIncomeAmountInfo,
    isLoading,
    // useRef
    scrollTopRef,
    scrollBottomRef,
    // function
    handleAddCard,
    saveButtonClick,
  };
}

export default useInputPage;
