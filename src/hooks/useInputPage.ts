import { useEffect, useRef, useState } from 'react';

import axios from 'axios';

import { getCurrentDay } from '../configs/util';

import type { RegistrationData } from '../types/api';
import type { CardInfo, IncomeAmountErrorInfo, SpendingAmountErrorInfo } from '../types/type';

const ERROR_MESSAGE_1 = '未入力です。';
const ERROR_MESSAGE_2 = '金額が0円以下です。';

function useInputPage() {
  // トグルボタンの状態管理
  const [toggleState, setToggleState] = useState<boolean>(true);
  // 支出情報の状態管理
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [cardCount, setCardCount] = useState<number>(1);
  const [spendingDateInfo, setSpendingDateInfo] = useState<string>(getCurrentDay());
  const [spendingCategoryInfo, setSpendingCategoryInfo] = useState<number>(1);
  const [spendingMemoInfo, setSpendingMemoInfo] = useState<string>('');
  const [cardInfo, setCardInfo] = useState<CardInfo>([
    {
      memo: '',
      amount: 0,
      valid: true,
      errorInfo: { memoErr: false, memoMessage: '', amountErr: false, amountMessage: '' },
    },
  ]);
  // 補充情報の状態管理
  const [incomeDateInfo, setIncomeDateInfo] = useState<string>(getCurrentDay());
  const [incomeMemoInfo, setIncomeMemoInfo] = useState<string>('');
  const [incomeAmountInfo, setIncomeAmountInfo] = useState<number>(0);
  // ローディング画面の状態管理
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // TextFieldのエラー情報管理
  const [spendingError, setSpendingError] = useState<SpendingAmountErrorInfo>({
    memoErr: false,
    memoMessage: '',
  });
  const [incomeError, setIncomeError] = useState<IncomeAmountErrorInfo>({
    memoErr: false,
    memoMessage: '',
    amountErr: false,
    amountMessage: '',
  });
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
    newInputCardInfo.push({
      memo: '',
      amount: 0,
      valid: true,
      errorInfo: { memoErr: false, memoMessage: '', amountErr: false, amountMessage: '' },
    });
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

    // 入力チェック
    let errorFlag: boolean = false;

    // 支出モードのチェック
    if (toggleState) {
      const errObj = { ...spendingError };
      // メモが空文字の場合
      if (!data.memo) {
        errObj.memoErr = true;
        errObj.memoMessage = ERROR_MESSAGE_1;
        errorFlag = true;
      } else {
        errObj.memoErr = false;
        errObj.memoMessage = '';
      }
      setSpendingError(errObj);

      const errCardObj = [...cardInfo];
      for (let i = 0; i < cardInfo.length; i += 1) {
        // カード内のメモが空文字の場合
        if (cardInfo[i].valid && !cardInfo[i].memo) {
          errCardObj[i].errorInfo.memoErr = true;
          errCardObj[i].errorInfo.memoMessage = ERROR_MESSAGE_1;
          errorFlag = true;
        } else {
          errCardObj[i].errorInfo.memoErr = false;
          errCardObj[i].errorInfo.memoMessage = '';
        }
        // カード内の金額が0円以下の場合
        if (cardInfo[i].valid && !cardInfo[i].amount) {
          errCardObj[i].errorInfo.amountErr = true;
          errCardObj[i].errorInfo.amountMessage = ERROR_MESSAGE_2;
          errorFlag = true;
        } else {
          errCardObj[i].errorInfo.amountErr = false;
          errCardObj[i].errorInfo.amountMessage = '';
        }
        setCardInfo(errCardObj);
      }
    }

    // 補充モードのチェック
    if (!toggleState) {
      const errObj = { ...incomeError };
      // メモが空文字の場合
      if (!data.memo) {
        errObj.memoErr = true;
        errObj.memoMessage = ERROR_MESSAGE_1;
        errorFlag = true;
      } else {
        errObj.memoErr = false;
        errObj.memoMessage = '';
      }
      // 金額が0円以下の場合
      if (!data.totalAmount || data.totalAmount <= 0) {
        errObj.amountErr = true;
        errObj.amountMessage = ERROR_MESSAGE_2;
        errorFlag = true;
      } else {
        errObj.amountErr = false;
        errObj.amountMessage = '';
      }
      setIncomeError(errObj);
    }

    if (errorFlag) {
      setIsLoading(false);
      return;
    }

    // API通信
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
    setSpendingError({ memoErr: false, memoMessage: '' });
    setIncomeError({ memoErr: false, memoMessage: '', amountErr: false, amountMessage: '' });

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
    spendingError,
    incomeError,
    // useRef
    scrollTopRef,
    scrollBottomRef,
    // function
    handleAddCard,
    saveButtonClick,
  };
}

export default useInputPage;
